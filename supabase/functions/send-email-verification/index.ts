import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailVerificationRequest {
  email: string;
  confirmationUrl: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, confirmationUrl, userName }: EmailVerificationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Hub de Entidades Insper <onboarding@resend.dev>",
      to: [email],
      subject: "Confirme seu email - Hub de Entidades Insper",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background-color: #dc2626; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="color: white; font-weight: bold; font-size: 24px;">I</span>
            </div>
            <h1 style="color: #1f2937; margin: 0;">Hub de Entidades Insper</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Bem-vindo ao Hub de Entidades!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              ${userName ? `Olá ${userName}!` : 'Olá!'} 
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              Sua conta foi criada com sucesso no Hub de Entidades Insper! 
              Agora você pode explorar todas as oportunidades disponíveis e conectar-se 
              com as melhores entidades estudantis.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background-color: #dc2626; color: white; padding: 14px 28px; 
                        text-decoration: none; border-radius: 8px; font-weight: 600; 
                        display: inline-block; font-size: 16px;">
                Acessar Plataforma
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Sua conta foi criada com sucesso! Clique no botão acima para acessar a plataforma e completar seu perfil.<br>
              <a href="${confirmationUrl}" style="color: #dc2626; word-break: break-all;">${confirmationUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 14px;">
            <p>Este email foi enviado para ${email}</p>
            <p>Seja bem-vindo ao Hub de Entidades Insper!</p>
            <p style="margin-top: 20px;">
              <strong>Hub de Entidades Insper</strong><br>
              Conectando estudantes às melhores oportunidades
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email-verification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);