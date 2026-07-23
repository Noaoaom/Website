import type { MenuPanel } from "@/lib/menuPanels";
import AboutContent from "./AboutContent";
import ContactsContent from "./ContactsContent";
import ImpressumContent from "./ImpressumContent";

type MenuPanelViewProps = {
  panel: MenuPanel;
  onBack: () => void;
};

export default function MenuPanelView({ panel, onBack }: MenuPanelViewProps) {
  switch (panel) {
    case "about":
      return <AboutContent variant="menu" onBack={onBack} />;
    case "contacts":
      return <ContactsContent variant="menu" onBack={onBack} />;
    case "impressum":
      return <ImpressumContent variant="menu" onBack={onBack} />;
  }
}
