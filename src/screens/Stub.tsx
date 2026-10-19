/* Placeholder honesto para pantallas aún no construidas. No simula una UI
   terminada: declara que es la próxima etapa y qué va a contener. */
import { Panel } from "../components/shell/ui";

export default function Stub({ titulo, sub, contenido }: { titulo: string; sub: string; contenido: string[] }) {
  return (
    <div className="screen">
      <div className="screen__head">
        <div className="screen__titles">
          <h1 className="screen__title">{titulo}</h1>
          <p className="screen__sub">{sub}</p>
        </div>
      </div>
      <div className="stub">
        <div className="stub__card">
          <div className="demo-badge stub__badge">Próxima etapa</div>
          <h2>Pantalla en construcción</h2>
          <p>
            Esta vista se integra con los mismos datos y componentes compartidos.
            Va a incluir: {contenido.join(", ")}.
          </p>
        </div>
      </div>
    </div>
  );
}
