import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-insper-light-gray-1 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo-hub-entidades.svg" 
                alt="Hub de Entidades Insper" 
                className="w-6 h-6"
              />
              <span className="text-lg font-bold text-insper-black">
                Hub de Entidades
              </span>
            </div>
            <p className="text-sm text-insper-dark-gray">
              Conectando alunos com organizações estudantis do Insper.
            </p>
          </div>

          {/* Links Rápidos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-insper-black">
              Links Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="text-sm text-insper-dark-gray hover:text-insper-black transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/entidades" 
                  className="text-sm text-insper-dark-gray hover:text-insper-black transition-colors"
                >
                  Organizações
                </Link>
              </li>
              <li>
                <Link 
                  to="/eventos" 
                  className="text-sm text-insper-dark-gray hover:text-insper-black transition-colors"
                >
                  Eventos
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-insper-black">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/termos-uso" 
                  className="text-sm text-insper-dark-gray hover:text-insper-black transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link 
                  to="/termos-uso" 
                  className="text-sm text-insper-dark-gray hover:text-insper-black transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <p className="text-xs text-insper-dark-gray">
            © {new Date().getFullYear()} Hub de Entidades Insper. Todos os direitos reservados.
          </p>
          <div className="flex items-center space-x-4">
            <a 
              href="https://www.linkedin.com/in/gabriel-pradyumna-alencar-costa-8887a6201/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-insper-dark-gray hover:text-insper-red transition-colors"
            >
              Gabriel Pradyumna
            </a>
            <a 
              href="https://www.linkedin.com/in/mateus-bellon-melzi-6381111a9/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-insper-dark-gray hover:text-insper-red transition-colors"
            >
              Mateus Melzi
            </a>
            <a 
              href="https://www.instagram.com/hubdeentidades/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-insper-dark-gray hover:text-insper-red transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 