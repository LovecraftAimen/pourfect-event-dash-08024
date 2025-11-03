import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="mb-4 text-3xl md:text-4xl font-bold">404</h1>
        <p className="mb-4 text-lg md:text-xl text-muted-foreground">Oops! Página não encontrada</p>
        <a href="/" className="text-primary underline hover:opacity-80">
          Voltar ao Início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
