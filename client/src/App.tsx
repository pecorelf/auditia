import { useStore } from "./store/useStore";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { EspacioUno } from "./views/EspacioUno";
import { EspacioDos } from "./views/EspacioDos";
import { EspacioTres } from "./views/EspacioTres";
import { EspacioCuatro } from "./views/EspacioCuatro";
import { EspacioCinco } from "./views/EspacioCinco";
import { EspacioSeis } from "./views/EspacioSeis";
import { Admin } from "./views/Admin";

export default function App() {
  const user = useStore((s) => s.user);
  const espacio = useStore((s) => s.espacio);

  if (!user) return <Login />;

  return (
    <Layout>
      {espacio === "uno" && <EspacioUno />}
      {espacio === "dos" && <EspacioDos />}
      {espacio === "tres" && <EspacioTres />}
      {espacio === "cuatro" && <EspacioCuatro />}
      {espacio === "cinco" && <EspacioCinco />}
      {espacio === "seis" && <EspacioSeis />}
      {espacio === "admin" && <Admin />}
    </Layout>
  );
}
