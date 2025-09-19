import React from "react";
import Section from "./Section";
import { socials, navigation } from "../constants";
import { logoImage } from "../assets";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const Footer = () => {
  return (
    <Section crosses className="!px-0 !py-16 bg-gradient-to-b from-n-8/10 to-n-12/10 dark:from-n-8 dark:to-n-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10 pb-10 border-b dark:border-n-6 border-n-3/10">
          {/* Logo et Description */}
          <div className="flex flex-col">
            <div className="flex items-center mb-4">
              <img src={logoImage} alt="Sorikama Logo" className="h-8 mr-2" />
              <span className="dark:text-n-1 text-n-8 font-bold text-xl">sorikama</span>
            </div>
            <p className="body-2 dark:text-n-3 text-n-5 mb-6">
              Un écosystème numérique intégré conçu pour répondre aux besoins spécifiques de l'Afrique, avec des applications interconnectées et accessibles.
            </p>
            <div className="flex gap-4">
              {socials.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  className="flex items-center justify-center w-10 h-10 dark:bg-n-7 bg-n-3/20 rounded-full transition-colors dark:hover:bg-n-6 hover:bg-n-3/40"
                >
                  <img src={item.iconUrl} width={16} height={16} alt={item.title} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col">
            <h5 className="text-lg font-bold mb-4 dark:text-n-1 text-n-8">Navigation</h5>
            <ul className="flex flex-col gap-2">
              {navigation
                .filter(item => !item.onlyMobile)
                .map((item) => (
                  <li key={item.id}>
                    <a href={item.url} className="text-sm dark:text-n-3 text-n-5 hover:dark:text-n-1 hover:text-n-8 transition-colors">
                      {item.title}
                    </a>
                  </li>
                ))}
            </ul>
          </div>

          {/* Applications */}
          <div className="flex flex-col">
            <h5 className="text-lg font-bold mb-4 dark:text-n-1 text-n-8">Applications</h5>
            <ul className="flex flex-col gap-2">
              <li><a href="#" className="text-sm dark:text-n-3 text-n-5 hover:dark:text-n-1 hover:text-n-8 transition-colors">Masebuy</a></li>
              <li><a href="#" className="text-sm dark:text-n-3 text-n-5 hover:dark:text-n-1 hover:text-n-8 transition-colors">Jobowo</a></li>
              <li><a href="#" className="text-sm dark:text-n-3 text-n-5 hover:dark:text-n-1 hover:text-n-8 transition-colors">SoriLead</a></li>
              <li><a href="#" className="text-sm dark:text-n-3 text-n-5 hover:dark:text-n-1 hover:text-n-8 transition-colors">SoriPay</a></li>
              <li><a href="#" className="text-sm dark:text-n-3 text-n-5 hover:dark:text-n-1 hover:text-n-8 transition-colors">SoriLearn</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col">
            <h5 className="text-lg font-bold mb-4 dark:text-n-1 text-n-8">Contact</h5>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-2">
                <FiMail className="text-color-1" />
                <a href="mailto:contact@sorikama.com" className="text-sm dark:text-n-3 text-n-5 hover:dark:text-n-1 hover:text-n-8 transition-colors">contact@sorikama.com</a>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="text-color-1" />
                <span className="text-sm dark:text-n-3 text-n-5">+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-2">
                <FiMapPin className="text-color-1" />
                <span className="text-sm dark:text-n-3 text-n-5">Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="caption dark:text-n-4 text-n-5">
            © {new Date().getFullYear()} Sorikama. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs dark:text-n-4 text-n-5 hover:dark:text-n-1 hover:text-n-8 transition-colors">Politique de confidentialité</a>
            <a href="#" className="text-xs dark:text-n-4 text-n-5 hover:dark:text-n-1 hover:text-n-8 transition-colors">Conditions d'utilisation</a>
            <a href="#" className="text-xs dark:text-n-4 text-n-5 hover:dark:text-n-1 hover:text-n-8 transition-colors">Mentions légales</a>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Footer;
