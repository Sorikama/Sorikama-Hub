const Partners = () => {
  return (
    <main className="min-h-dvh bg-milk text-dark-brown">
      <section className="max-w-7xl mx-auto md:px-9 px-5 md:pt-28 pt-24">
        <h1 className="general-title">Partenaires</h1>
        <p className="font-paragraph md:text-xl text-lg mt-6 opacity-80">
          Rejoignez l'écosystème Sorikama pour co-créer des expériences connectées.
        </p>
        <div className="mt-10 flex flex-col gap-4">
          <div className="p-6 rounded-2xl border border-[#E5E7EB] bg-white">
            <h2 className="text-2xl font-bold">Programme de partenariat</h2>
            <p className="font-paragraph mt-2 opacity-90">API, documentation et support dédié.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Partners;
