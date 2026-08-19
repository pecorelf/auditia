import { useStore } from "./store/useStore";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { EspacioUno } from "./views/EspacioUno";
import { EspacioDos } from "./views/EspacioDos";
import { EspacioTres } from "./views/EspacioTres";
import { EspacioCuatro } from "./views/EspacioCuatro";
import { EspacioCinco } from "./views/EspacioCinco";
import { EspacioSeis } from "./views/EspacioSeis";
import { EspacioAFP } from "./views/EspacioAFP";
import { Admin } from "./views/Admin";
import { getPackActivo } from "./packs";
import { aplicarEscala, getEscala } from "./components/ModoPresentacion";

// Aplica la escala guardada antes del primer render, para que no haya salto.
aplicarEscala(getEscala());

export default function App() {
  // Al cambiar de pack, el espacio guardado puede ya no existir en el menú.
  const disponibles = getPackActivo().espaciosDisponibles;
  const user = useStore((s) => s.user);
  const espacioGuardado = useStore((s) => s.espacio);

  if (!user) return <Login />;

  // Si el pack no soporta el espacio guardado, cae al 01 en vez de dejar la
  // pantalla en blanco.
  const espacio =
    espacioGuardado === "admin" || disponibles.includes(espacioGuardado)
      ? espacioGuardado
      : "uno";

  return (
    <Layout>
      {espacio === "uno" && <EspacioUno />}
      {espacio === "dos" && <EspacioDos />}
      {espacio === "tres" && <EspacioTres />}
      {espacio === "cuatro" && <EspacioCuatro />}
      {espacio === "cinco" && <EspacioCinco />}
      {espacio === "seis" && <EspacioSeis />}
      {espacio === "procesos" && <EspacioAFP />}
      {espacio === "admin" && <Admin />}
    </Layout>
  );
}
