import Layout from '../../components/Layout';

export default function ProjectDetailsPage() {
  return (
    <Layout title="Project Details | pchcc.com.ph">
      <section className="inner-banner-wrp project-banner-wrp">
        <div className="container">
          <div className="inner-banner-block">
            <h1>Projects</h1>
          </div>
        </div>
      </section>

      <section className="projects-details-wrp">
        <div className="container">
          <h2>The New Pasig City Hall</h2>

          <div className="overview-bx">
            <h3>Overview</h3>
            <p>
              The New Pasig City Hall will rise over a 20,000 sqm site, with a total floor area of around 45,000 sqm and around a
              6,500 sqm of landscaped development. Designed to accommodate over 4,500 employees, the building will be completed
              within 24 months.
            </p>
          </div>

          <h4>Key Features</h4>
          <p>
            <strong>Smart &amp; Eco-Friendly</strong> Green building design to save on energy and water
          </p>

          <p>
            <strong>ICT-Ready</strong> Future-proof technology for efficient public service
          </p>
          <p>
            <strong>Secure &amp; Safe</strong> Comprehensive surveillance and safety systems
          </p>
          <p>
            <strong>Fully Functional</strong> Complete with finishing, furniture, and fixtures—ready for immediate use
          </p>

          <div className="project-cover-img">
            <figure>
              <img src="/images/project-cover.png" alt="Aerial rendering of the new Pasig City Hall" />
            </figure>
          </div>
        </div>
      </section>
    </Layout>
  );
}
