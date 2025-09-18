const Solutions = () => {
  return (
    <main className="min-h-dvh bg-milk text-dark-brown">
      <section className="max-w-7xl mx-auto md:px-9 px-5 md:pt-28 pt-24">
        <h1 className="general-title">Solutions</h1>
        <p className="font-paragraph md:text-xl text-lg mt-6 opacity-80">
          Découvrez nos solutions unifiées au sein de l'écosystème Sorikama.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <button className="px-4 py-2 rounded-full border border-[#E5E7EB] bg-white text-sm font-semibold">Tous</button>
          <button className="px-4 py-2 rounded-full border border-[#E5E7EB] bg-white text-sm">Particuliers</button>
          <button className="px-4 py-2 rounded-full border border-[#E5E7EB] bg-white text-sm">Entreprises</button>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white">
            <h2 className="text-2xl font-bold">SoriStore</h2>
            <p className="font-paragraph mt-2 opacity-90">La place pour créer, vendre et gérer vos produits digitaux.</p>
          </div>
          <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white">
            <h2 className="text-2xl font-bold">SoriWork</h2>
            <p className="font-paragraph mt-2 opacity-90">Organisez vos tâches, projets et workflows simplement.</p>
          </div>
          <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white">
            <h2 className="text-2xl font-bold">SoriLead</h2>
            <p className="font-paragraph mt-2 opacity-90">Capturez, qualifiez et suivez vos prospects efficacement.</p>
          </div>
          <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white">
            <h2 className="text-2xl font-bold">SeriPay</h2>
            <p className="font-paragraph mt-2 opacity-90">Acceptez les paiements avec une intégration unique.</p>
          </div>
          <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white">
            <h2 className="text-2xl font-bold">SoriCard</h2>
            <p className="font-paragraph mt-2 opacity-90">Plusieurs cartes virtuelles pour des achats en ligne sécurisés.</p>
          </div>
          <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white">
            <h2 className="text-2xl font-bold">SoriWallet</h2>
            <p className="font-paragraph mt-2 opacity-90">Tous vos revenus et soldes, en un seul endroit.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Solutions;
