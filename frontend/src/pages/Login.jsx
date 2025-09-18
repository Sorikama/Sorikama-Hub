import { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: hook to backend auth API
    console.log("Login submit", form);
  };

  return (
    <main className="min-h-dvh bg-milk text-dark-brown">
      <section className="max-w-7xl mx-auto md:px-9 px-5">
        <div className="w-full min-h-[calc(100dvh-5rem)] md:min-h-[calc(100dvh-5rem)] flex flex-col justify-center items-center">
          <h1 className="general-title text-center">Connexion</h1>
          <div className="mt-10 max-w-xl w-full">
            <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-bold uppercase tracking-tight">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
                  className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                />
              </div>
              <button type="submit" className="self-start uppercase font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-500)] rounded-full md:py-3 py-2 md:px-6 px-4 transition-colors">
                Se connecter
              </button>
              <p className="mt-4 font-paragraph text-sm opacity-80">
                Pas encore de compte ? {" "}
                <Link to="/signup" className="font-bold text-[var(--color-primary)] underline underline-offset-4">Créez un compte</Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
