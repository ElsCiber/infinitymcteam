import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const DynamicMetaTags = () => {
  const { settings } = useSiteSettings();

  return (
    <Helmet>
      <title>{settings.og_title || "Infinity Team"}</title>
      <meta 
        name="description" 
        content={settings.og_description || "Infinity Team organiza eventos épicos de Minecraft. Survival Games, eventos personalizados y experiencias únicas para la comunidad."} 
      />
      
      {/* Open Graph */}
      <meta property="og:title" content={settings.og_title || "Infinity Team"} />
      <meta 
        property="og:description" 
        content={settings.og_description || "Infinity Team organiza eventos épicos de Minecraft. Survival Games, eventos personalizados y experiencias únicas para la comunidad."} 
      />
      <meta 
        property="og:image" 
        content={settings.og_image || "https://storage.googleapis.com/gpt-engineer-file-uploads/iV48OAp7K1XXXFmI95rrhCiBxlJ3/social-images/social-1763905044505-IMG_0962.jpeg"} 
      />
      
      {/* Twitter Card */}
      <meta name="twitter:title" content={settings.og_title || "Infinity Team"} />
      <meta 
        name="twitter:description" 
        content={settings.og_description || "Infinity Team organiza eventos épicos de Minecraft. Survival Games, eventos personalizados y experiencias únicas para la comunidad."} 
      />
      <meta 
        name="twitter:image" 
        content={settings.og_image || "https://storage.googleapis.com/gpt-engineer-file-uploads/iV48OAp7K1XXXFmI95rrhCiBxlJ3/social-images/social-1763905044505-IMG_0962.jpeg"} 
      />
    </Helmet>
  );
};
