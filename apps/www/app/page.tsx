import { HealthBadge } from '@/features/health/ui/HealthBadge';

const steps = [
  {
    title: 'Avalie',
    text: 'Dê notas aos filmes e séries que você já assistiu.',
  },
  {
    title: 'Descubra',
    text: 'Calculamos a similaridade entre os seus gostos e os de outras pessoas.',
  },
  {
    title: 'Conecte',
    text: 'Converse com quem combina com você e troque recomendações.',
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>
          Movie<span>Match</span>
        </h1>
        <p>Encontre pessoas que amam os mesmos filmes e séries que você.</p>
        <small>Em breve</small> <HealthBadge />
      </section>
      <section className="steps">
        {steps.map((step, i) => (
          <article key={step.title}>
            <b>{i + 1}</b>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
