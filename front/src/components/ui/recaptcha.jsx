import * as React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { cn } from "@/lib/utils";

// Chave de teste padrão do reCAPTCHA para ambiente de desenvolvimento
const DEFAULT_TEST_SITEKEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

const Recaptcha = React.forwardRef(
  ({ className, onChange, sitekey, size = "normal", theme = "light", ...props }, ref) => {
    // Determina qual chave usar baseado no ambiente
    const isDevelopment = import.meta.env.DEV;
    const finalSiteKey = isDevelopment ? DEFAULT_TEST_SITEKEY : sitekey;

    return (
      <div className={cn("flex w-full justify-center", className)}>
        <ReCAPTCHA
          ref={ref}
          sitekey={finalSiteKey}
          onChange={onChange}
          size={size}
          theme={theme}
          {...props}
        />
      </div>
    );
  }
);

Recaptcha.displayName = "Recaptcha";

export { Recaptcha }; 