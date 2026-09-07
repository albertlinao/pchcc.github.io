import Layout from '../components/Layout';

const SERVICES = [
  {
    acronym: 'SCIC',
    name: 'Sta. Clara International Corporation (SCIC)',
    description:
      'A leading engineering and main contracting group with global experience in power, infrastructure, and civil engineering sectors.',
    link: 'https://staclara.com.ph/',
    label: 'Explore SCIC',
  },
  {
    acronym: 'BHBI',
    name: 'Bandar Hebat Builders, Inc. (BHBI)',
    description:
      'A construction company driven by passion and innovation, known for redefining quality through hands-on leadership and world-class practices.',
    link: 'https://www.bandarhebatbuilders.com/',
    label: 'Explore BHBI',
  },
  {
    acronym: 'PPMC',
    name: 'Philjaya Property Management Corporation (PPMC)',
    description:
      'A subsidiary of MTD Philippines, Inc. and a member of the Alloy MTD Group of Malaysia, with expertise in government and infrastructure development.',
    link: 'https://philjaya.mtdphilippines.com/',
    label: 'Explore PPMC',
  },
];

export default function ServicesPage() {
  return (
    <Layout title="Services | pchcc.com.ph">
      <section className="inner-banner-wrp">
        <div className="container">
          <div className="inner-banner-block">
            <h1>Services</h1>
          </div>
        </div>
      </section>

      <section className="service-wrp">
        <div className="container">
          <div className="titlebar">
            <h2>
              Our Services. <span>Unified Strength.</span>
            </h2>
          </div>

          <div className="row">
            {SERVICES.map((service) => (
              <div className="col-md-4 col-sm-12" key={service.acronym}>
                <div className="service-block">
                  <div className="service-title">
                    <h3>{service.acronym}</h3>
                  </div>

                  <div className="service-data">
                    <h3>{service.name}</h3>

                    <div className="service-infobx">
                      <p>{service.description}</p>
                    </div>

                    <div className="btn-group">
                      <a href={service.link} target="_blank" rel="noreferrer">
                        <figure>
                          <img src="/images/right-ar-blue.svg" alt="Arrow" />
                        </figure>
                        {service.label}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
