from datetime import datetime
from typing import Optional, List, Dict, Any
from bson import ObjectId
from app.db.mongodb import db
from app.models.order import OrderInDB, OrderCreate, OrderResponse, OrderDetailResponse, OrderUpdate
from app.services import product_service
from app.core.config import settings
import stripe
import logging

logger = logging.getLogger(__name__)

# Configure Stripe API key
stripe.api_key = settings.STRIPE_API_KEY

async def create_order(order_data: OrderCreate, customer_id: str) -> OrderDetailResponse:
    """
    Create a new order
    """
    # Validate products and calculate total
    total = 0
    items = []
    
    for item in order_data.items:
        product = await product_service.get_product_by_id(str(item.product_id))
        if not product:
            raise ValueError(f"Product with ID {item.product_id} not found")
        
        # Validate price
        if product.price != item.product_price:
            raise ValueError(f"Price mismatch for product {product.title}")
        
        total += product.price * item.quantity
        items.append(item)
    
    # Validate total
    if abs(total - order_data.total) > 0.01:  # Allow small floating point differences
        raise ValueError(f"Total mismatch: calculated {total}, received {order_data.total}")
    
    # Create order
    order_in_db = OrderInDB(
        **order_data.dict(),
        customer_id=ObjectId(customer_id),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    result = await db.db.orders.insert_one(order_in_db.dict(by_alias=True))
    
    # Get created order
    created_order = await get_order_by_id(str(result.inserted_id))
    
    return created_order

async def get_order_by_id(order_id: str) -> Optional[OrderDetailResponse]:
    """
    Get an order by ID
    """
    if not ObjectId.is_valid(order_id):
        return None
    
    order_dict = await db.db.orders.find_one({"_id": ObjectId(order_id)})
    
    if not order_dict:
        return None
    
    order = OrderInDB(**order_dict)
    
    # Convert items
    items = []
    for item in order.items:
        items.append({
            "product_id": str(item.product_id),
            "product_title": item.product_title,
            "product_price": item.product_price,
            "quantity": item.quantity
        })
    
    return OrderDetailResponse(
        id=str(order.id),
        items=items,
        total=order.total,
        status=order.status,
        payment_intent_id=order.payment_intent_id,
        payment_status=order.payment_status,
        metadata=order.metadata,
        store_id=str(order.store_id),
        customer_id=str(order.customer_id),
        created_at=order.created_at,
        updated_at=order.updated_at,
        paid_at=order.paid_at,
        completed_at=order.completed_at,
        cancelled_at=order.cancelled_at
    )

async def get_orders_by_customer(
    customer_id: str,
    page: int = 1,
    limit: int = 10,
    status: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get orders by customer with pagination and filters
    """
    if not ObjectId.is_valid(customer_id):
        return {
            "items": [],
            "total": 0,
            "page": page,
            "limit": limit,
            "pages": 0
        }
    
    skip = (page - 1) * limit
    
    # Build query
    query = {"customer_id": ObjectId(customer_id)}
    
    if status:
        query["status"] = status
    
    # Get total count
    total = await db.db.orders.count_documents(query)
    
    # Get orders
    cursor = db.db.orders.find(query).sort("created_at", -1).skip(skip).limit(limit)
    orders = []
    
    async for order_dict in cursor:
        order = OrderInDB(**order_dict)
        
        # Convert items
        items = []
        for item in order.items:
            items.append({
                "product_id": str(item.product_id),
                "product_title": item.product_title,
                "product_price": item.product_price,
                "quantity": item.quantity
            })
        
        orders.append(
            OrderResponse(
                id=str(order.id),
                items=items,
                total=order.total,
                status=order.status,
                payment_intent_id=order.payment_intent_id,
                payment_status=order.payment_status,
                store_id=str(order.store_id),
                customer_id=str(order.customer_id),
                created_at=order.created_at,
                updated_at=order.updated_at,
                paid_at=order.paid_at,
                completed_at=order.completed_at,
                cancelled_at=order.cancelled_at
            )
        )
    
    return {
        "items": orders,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

async def get_orders_by_store(
    store_id: str,
    page: int = 1,
    limit: int = 10,
    status: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get orders by store with pagination and filters
    """
    if not ObjectId.is_valid(store_id):
        return {
            "items": [],
            "total": 0,
            "page": page,
            "limit": limit,
            "pages": 0
        }
    
    skip = (page - 1) * limit
    
    # Build query
    query = {"store_id": ObjectId(store_id)}
    
    if status:
        query["status"] = status
    
    # Get total count
    total = await db.db.orders.count_documents(query)
    
    # Get orders
    cursor = db.db.orders.find(query).sort("created_at", -1).skip(skip).limit(limit)
    orders = []
    
    async for order_dict in cursor:
        order = OrderInDB(**order_dict)
        
        # Convert items
        items = []
        for item in order.items:
            items.append({
                "product_id": str(item.product_id),
                "product_title": item.product_title,
                "product_price": item.product_price,
                "quantity": item.quantity
            })
        
        orders.append(
            OrderResponse(
                id=str(order.id),
                items=items,
                total=order.total,
                status=order.status,
                payment_intent_id=order.payment_intent_id,
                payment_status=order.payment_status,
                store_id=str(order.store_id),
                customer_id=str(order.customer_id),
                created_at=order.created_at,
                updated_at=order.updated_at,
                paid_at=order.paid_at,
                completed_at=order.completed_at,
                cancelled_at=order.cancelled_at
            )
        )
    
    return {
        "items": orders,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

async def update_order_status(order_id: str, status: str) -> Optional[OrderDetailResponse]:
    """
    Update order status
    """
    if not ObjectId.is_valid(order_id):
        return None
    
    # Get current order
    order = await get_order_by_id(order_id)
    if not order:
        return None
    
    # Update status and timestamps
    update_data = {"status": status, "updated_at": datetime.utcnow()}
    
    if status == "paid" and order.status != "paid":
        update_data["paid_at"] = datetime.utcnow()
    elif status == "completed" and order.status != "completed":
        update_data["completed_at"] = datetime.utcnow()
    elif status == "cancelled" and order.status != "cancelled":
        update_data["cancelled_at"] = datetime.utcnow()
    
    # Update order
    await db.db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": update_data}
    )
    
    # Get updated order
    return await get_order_by_id(order_id)

async def update_order(order_id: str, order_data: OrderUpdate) -> Optional[OrderDetailResponse]:
    """
    Update order
    """
    if not ObjectId.is_valid(order_id):
        return None
    
    # Get current order
    order = await get_order_by_id(order_id)
    if not order:
        return None
    
    # Update order
    update_data = order_data.dict(exclude_unset=True)
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        
        # Update timestamps based on status
        if "status" in update_data:
            if update_data["status"] == "paid" and order.status != "paid":
                update_data["paid_at"] = datetime.utcnow()
            elif update_data["status"] == "completed" and order.status != "completed":
                update_data["completed_at"] = datetime.utcnow()
            elif update_data["status"] == "cancelled" and order.status != "cancelled":
                update_data["cancelled_at"] = datetime.utcnow()
        
        await db.db.orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": update_data}
        )
    
    # Get updated order
    return await get_order_by_id(order_id)

async def create_payment_session(order_id: str, success_url: str, cancel_url: str) -> Dict[str, str]:
    """
    Create a Stripe payment session for an order
    """
    # Get order
    order = await get_order_by_id(order_id)
    if not order:
        raise ValueError("Order not found")
    
    # Check if order is already paid
    if order.status == "paid":
        raise ValueError("Order is already paid")
    
    # Create line items for Stripe
    line_items = []
    for item in order.items:
        line_items.append({
            "price_data": {
                "currency": "usd",
                "product_data": {
                    "name": item.product_title,
                },
                "unit_amount": int(item.product_price * 100),  # Convert to cents
            },
            "quantity": item.quantity,
        })
    
    # Create Stripe session
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "order_id": order_id
            }
        )
        
        # Update order with payment intent ID
        await update_order(
            order_id,
            OrderUpdate(
                payment_intent_id=session.payment_intent,
                payment_status="awaiting"
            )
        )
        
        return {
            "session_id": session.id,
            "url": session.url
        }
    except Exception as e:
        logger.error(f"Error creating Stripe session: {str(e)}")
        raise ValueError(f"Error creating payment session: {str(e)}")

async def handle_payment_webhook(event_data: Dict[str, Any]) -> bool:
    """
    Handle Stripe payment webhook
    """
    event_type = event_data.get("type")
    
    if event_type == "checkout.session.completed":
        session = event_data.get("data", {}).get("object", {})
        payment_intent = session.get("payment_intent")
        metadata = session.get("metadata", {})
        order_id = metadata.get("order_id")
        
        if not order_id:
            logger.error("No order ID in metadata")
            return False
        
        # Update order status
        await update_order(
            order_id,
            OrderUpdate(
                status="paid",
                payment_status="succeeded"
            )
        )
        
        return True
    
    elif event_type == "payment_intent.payment_failed":
        payment_intent = event_data.get("data", {}).get("object", {})
        payment_intent_id = payment_intent.get("id")
        
        # Find order by payment intent ID
        order = await db.db.orders.find_one({"payment_intent_id": payment_intent_id})
        
        if not order:
            logger.error(f"No order found for payment intent {payment_intent_id}")
            return False
        
        # Update order status
        await update_order(
            str(order["_id"]),
            OrderUpdate(
                payment_status="failed"
            )
        )
        
        return True
    
    return False

async def check_payment_status(order_id: str) -> Dict[str, Any]:
    """
    Check payment status of an order
    """
    # Get order
    order = await get_order_by_id(order_id)
    if not order:
        raise ValueError("Order not found")
    
    # If no payment intent, return current status
    if not order.payment_intent_id:
        return {
            "status": order.status,
            "payment_status": order.payment_status
        }
    
    # Check payment status in Stripe
    try:
        payment_intent = stripe.PaymentIntent.retrieve(order.payment_intent_id)
        
        # Update order if payment status changed
        if payment_intent.status != order.payment_status:
            update_data = {"payment_status": payment_intent.status}
            
            # If payment succeeded, update order status
            if payment_intent.status == "succeeded" and order.status != "paid":
                update_data["status"] = "paid"
            
            await update_order(order_id, OrderUpdate(**update_data))
            
            # Get updated order
            order = await get_order_by_id(order_id)
        
        return {
            "status": order.status,
            "payment_status": order.payment_status
        }
    except Exception as e:
        logger.error(f"Error checking payment status: {str(e)}")
        return {
            "status": order.status,
            "payment_status": order.payment_status,
            "error": str(e)
        }
