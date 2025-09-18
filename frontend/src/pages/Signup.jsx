import { useState } from "react";
import { Link } from "react-router-dom";

const Signup = () => {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    // TODO: hook to backend signup API
    console.log("Signup submit", form);
  };

  return (
    <main className="min-h-dvh bg-milk text-dark-brown">
      <section className="max-w-7xl mx-auto md:px-9 px-5">
        <div className="w-full min-h-[calc(100dvh-5rem)] md:min-h-[calc(100dvh-5rem)] flex flex-col justify-center items-center">
          <h1 className="general-title text-center">Inscription</h1>
          <div className="mt-10 max-w-xl w-full">
            <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="fullName" className="font-bold uppercase tracking-tight">Nom complet</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="w-full rounded-xl border border-[#C89C6E] bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Votre nom complet"
                  value={form.fullName}
                  onChange={onChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-bold uppercase tracking-tight">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-[#C89C6E] bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={onChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="font-bold uppercase tracking-tight">Mot de passe</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-xl border border-[#C89C6E] bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className="font-bold uppercase tracking-tight">Confirmer mot de passe</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full rounded-xl border border-[#C89C6E] bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={onChange}
                />
              </div>
              {error && <p className="text-red font-paragraph">{error}</p>}
              <button type="submit" className="self-start uppercase font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] rounded-full md:py-3 py-2 md:px-6 px-4 transition-colors">
                Créer un compte
              </button>
              <p className="mt-4 font-paragraph text-sm opacity-80">
                Déjà un compte ? {" "}
                <Link to="/login" className="font-bold text-[var(--color-primary)] underline underline-offset-4">Connectez-vous</Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Signup;
