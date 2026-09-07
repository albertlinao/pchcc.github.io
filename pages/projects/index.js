import Link from 'next/link';
import Layout from '../../components/Layout';

export default function ProjectsPage() {
  return (
    <Layout title="Projects | pchcc.com.ph">
      <section className="inner-banner-wrp">
        <div className="container">
          <div className="inner-banner-block">
            <h1>Projects</h1>
          </div>
        </div>
      </section>

      <section className="projects-wrp">
        <div className="container">
          <div className="projects-slider">
            <div className="project-block">
              <div className="project-img">
                <figure>
                  <img src="/images/project-img1.png" alt="Rendering of the new Pasig City Hall" />
                </figure>
              </div>
              <div className="project-data">
                <h3>The New Pasig City Hall</h3>
                <p>
                  The New Pasig City Hall will rise over a 20,000 sqm site, with a total floor area of around 45,000 sqm...
                </p>

                <Link href="/projects/new-pasig-city-hall">
                  Read More
                  <figure>
                    <img src="/images/right-ar-blue2.svg" alt="Arrow" />
                  </figure>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
