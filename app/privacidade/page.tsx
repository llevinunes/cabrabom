import type { Metadata } from "next";
import { BrandMark } from "@/components/ui/BrandMark";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export const metadata: Metadata = { title: "Política de privacidade · CabraBom" };

const CONTACT = "llevinsousa@gmail.com";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

// Spec section 9 (LGPD). Also the privacy policy URL the Meta app asks for.
export default function Privacy() {
  return (
    <main className="flex flex-col gap-5 text-[15px]">
      <BrandMark />
      <ScreenHeader title="Política de privacidade" subtitle="Atualizada em 3 de novembro de 2026" />

      <p>
        O CabraBom ajuda você a encontrar prestadores de serviço perto de você e a conversar com eles pelo WhatsApp.
        Aqui explicamos quais dados guardamos, para quê e como pedir a exclusão.
      </p>

      <Section title="Quais dados guardamos">
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>
            <strong>Seu número de WhatsApp</strong>, quando você entra no CabraBom. A mensagem que você envia com o código
            serve só para confirmar que o número é seu.
          </li>
          <li>
            <strong>Dados do prestador:</strong> nome, categorias, número de WhatsApp, bairro, cidade e a localização do
            local de atendimento.
          </li>
          <li>
            <strong>Pedidos de serviço:</strong> a descrição que o cliente escreve, o número de quem confirmou e as datas
            de cada etapa.
          </li>
          <li>
            <strong>Recomendações</strong> e <strong>relatos de problema</strong> que você enviar.
          </li>
          <li>
            <strong>Endereço IP</strong>, por pouco tempo, para limitar tentativas repetidas de login e de relato.
          </li>
          <li>
            <strong>Notificações:</strong> o endereço que o seu navegador cria para receber avisos, se você ativá-los.
          </li>
        </ul>
        <p>
          A localização usada na busca serve só para mostrar os prestadores próximos e não fica guardada. Não usamos
          seus dados para publicidade e não os vendemos.
        </p>
      </Section>

      <Section title="O que fica visível">
        <ul className="flex list-disc flex-col gap-1 pl-5">
          <li>
            O WhatsApp do prestador aparece no perfil dele, com o consentimento dado no cadastro. A localização do
            prestador nunca aparece exata, só o bairro e a distância arredondada.
          </li>
          <li>O número do cliente nunca é mostrado a outras pessoas. Ele só serve para confirmar recomendações.</li>
          <li>Relatos de problema são vistos só pela equipe do CabraBom.</li>
        </ul>
      </Section>

      <Section title="Por quanto tempo">
        <p>
          A sessão de login dura até 180 dias ou até você sair. Códigos de login vencidos e os registros de IP são apagados em até dois dias.
          Os demais dados ficam guardados enquanto a sua conta existir ou até você pedir a exclusão.
        </p>
      </Section>

      <Section title="Quem processa os dados">
        <p>
          O CabraBom usa a Vercel (hospedagem), o Supabase (banco de dados) e a Meta (recebimento das mensagens do
          WhatsApp). As notificações passam pelo serviço de avisos do seu navegador.
        </p>
      </Section>

      <Section title="Seus direitos">
        <p>
          Pela LGPD, você pode pedir acesso, correção ou exclusão dos seus dados. Escreva para{" "}
          <a href={`mailto:${CONTACT}`} className="font-semibold text-laranja-texto underline">
            {CONTACT}
          </a>{" "}
          informando o número de WhatsApp usado no CabraBom.
        </p>
      </Section>
    </main>
  );
}
