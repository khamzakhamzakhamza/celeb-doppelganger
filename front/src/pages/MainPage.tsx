import './MainPage.scss';
import { Title } from "../components/Title";
import { MirrorFrame } from "../components/MirrorFrame";

export function MainPage() {
  return (
    <main className='main-page'>
      <section className='main-page__content--container'>
        <div className='mian-page__content'>
          <Title
            title="FIND YOUR CELEBRITY DOPPELGANGER"
            glowMode="static"
          />
          <MirrorFrame />
        </div>
      </section>
    </main>
  );
}
