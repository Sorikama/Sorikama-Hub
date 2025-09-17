from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from typing import Dict, Any, Optional, List
from app.models.order import OrderCreate, OrderUpdate, OrderResponse, OrderDetailResponse, PaymentSessionCreate
from app.models.user import UserResponse
from app.services import order_service
from app.api.routes.auth import get_current_user
import json

router = APIRouter()

@router.post("/", response_model=OrderDetailResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Create a new order
    """
    try:
        order = await order_service.create_order(order_data, current_user.id)
        return order
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/me", response_model=Dict[str, Any])
async def get_my_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get orders for the current user
    """
    try:
        orders = await order_service.get_orders_by_customer(
            customer_id=current_user.id,
            page=page,
            limit=limit,
            status=status
        )
        return orders
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/store/{store_id}", response_model=Dict[str, Any])
async def get_store_orders(
    store_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get orders for a store
    """
    # Check if user has permission to view store orders
    if store_id != current_user.storeId and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view orders for this store"
        )
    
    try:
        orders = await order_service.get_orders_by_store(
            store_id=store_id,
            page=page,
            limit=limit,
            status=status
        )
        return orders
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{order_id}", response_model=OrderDetailResponse)
async def get_order(
    order_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get an order by ID
    """
    order = await order_service.get_order_by_id(order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to view this order
    if order.customer_id != current_user.id and order.store_id != current_user.storeId and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this order"
        )
    
    return order

@router.put("/{order_id}/status", response_model=OrderDetailResponse)
async def update_order_status(
    order_id: str,
    status: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Update order status
    """
    # Get order
    order = await order_service.get_order_by_id(order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to update this order
    if order.store_id != current_user.storeId and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this order"
        )
    
    # Validate status
    valid_statuses = ["pending", "paid", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    try:
        updated_order = await order_service.update_order_status(order_id, status)
        return updated_order
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/payment-session", response_model=Dict[str, str])
async def create_payment_session(
    session_data: PaymentSessionCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Create a payment session for an order
    """
    # Get order
    order = await order_service.get_order_by_id(session_data.order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to pay for this order
    if order.customer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to pay for this order"
        )
    
    try:
        session = await order_service.create_payment_session(
            order_id=session_data.order_id,
            success_url=session_data.success_url,
            cancel_url=session_data.cancel_url
        )
        return session
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{order_id}/payment-status", response_model=Dict[str, Any])
async def check_payment_status(
    order_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Check payment status of an order
    """
    # Get order
    order = await order_service.get_order_by_id(order_id)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check if user has permission to view this order
    if order.customer_id != current_user.id and order.store_id != current_user.storeId and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this order"
        )
    
    try:
        status = await order_service.check_payment_status(order_id)
        return status
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook
    """
    # Get request body
    payload = await request.body()
    event_data = json.loads(payload)
    
    # Process webhook
    try:
        success = await order_service.handle_payment_webhook(event_data)
        if success:
            return {"status": "success"}
        else:
            return {"status": "ignored"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
