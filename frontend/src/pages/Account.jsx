const Account = () => {
  return (
    <main className="min-h-dvh bg-milk text-dark-brown">
      <section className="max-w-7xl mx-auto md:px-9 px-5 md:pt-28 pt-24">
        <h1 className="general-title">Compte</h1>
        <p className="font-paragraph md:text-xl text-lg mt-6 opacity-80">
          Gérez votre profil, vos préférences et la sécurité de votre compte Sorikama.
        </p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white">
            <h2 className="text-xl font-bold">Profil</h2>
            <p className="font-paragraph mt-2 opacity-90">Informations personnelles et visibilité.</p>
          </div>
          <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white">
            <h2 className="text-xl font-bold">Sécurité</h2>
            <p className="font-paragraph mt-2 opacity-90">Mot de passe, 2FA et permissions.</p>
          </div>
          <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white">
            <h2 className="text-xl font-bold">Abonnements</h2>
            <p className="font-paragraph mt-2 opacity-90">Gérez vos plans et factures.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Account;
