import Layout from '../components/Layout';

export default function AboutPage() {
  const timelineEvents = [
    {
      date: 'July 2023',
      description: 'City council approves the project in a vote of 15-3-3',
      isComplete: true,
    },
    {
      date: 'September 2023',
      description:
        'BTB Execom and PBAC technical working group conducts a site visit in the new Pasig City Hall',
      isComplete: true,
    },
    {
      date: 'November 2023',
      description: 'PBAC declares the PCHCC as the winning bidder for the Pasig City Hall project',
      isComplete: true,
    },
    {
      date: 'December 2023',
      description: 'Notice of Award received by PCHCC',
      isComplete: true,
    },
    {
      date: 'December 2023',
      description: 'Groundbreaking of the new Pasig City Hall',
      isComplete: true,
    },
    {
      date: 'January 2024',
      description: 'Relocation of flagpole to within the perimeter of the new Pasig City Hall',
      isComplete: true,
    },
    {
      date: 'October 15, 2025',
      description: 'Groundbreaking.',
      isComplete: true,
    },
  ];

  return (
    <Layout title="About Us | pchcc.com.ph">
      <section className="inner-banner-wrp">
        <div className="container">
          <div className="inner-banner-block">
            <h1>Who We Are?</h1>
          </div>
        </div>
      </section>

      <section className="about-pg-wrp">
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-sm-12">
              <div className="about-pg-data">
                <div className="titlebar">
                  <h2>
                    Discover Our <span>Story of Success</span>
                  </h2>
                </div>

                <p>
                  The Pasig City Hall Construction Consortium (PCHCC) is the trusted partner of the City Government of Pasig in
                  fulfilling its vision of a future-ready city hall—designed to deliver efficient services and a legacy of progress.
                </p>
              </div>
            </div>
            <div className="col-md-6 col-sm-12">
              <div className="about-pg-img">
                <figure>
                  <img src="/images/about-img.png" alt="Team working together" />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="foundation-wrp">
        <div className="container">
          <div className="titlebar">
            <h2>
              Foundation of <span>Our Success</span>
            </h2>
          </div>

          <div className="foundation-row">
            <div className="row">
              <div className="col-md-6 col-sm-12">
                <div className="vision-img">
                  <figure>
                    <img src="/images/vission-img1.png" alt="Aerial view of Pasig City development" />
                  </figure>
                </div>
              </div>
              <div className="col-md-6 col-sm-12">
                <div className="vision-img">
                  <figure>
                    <img src="/images/vission-img2.png" alt="Modern city hall concept" />
                  </figure>
                </div>
              </div>
            </div>

            <h3>Our Vision</h3>
            <p>To build the new Pasig City Hall as a legacy for generations to come</p>

            <div className="row">
              <div className="col-md-6 col-sm-12">
                <div className="vision-img">
                  <figure>
                    <img src="/images/mission-img1.png" alt="Engineers reviewing plans" />
                  </figure>
                </div>
              </div>
              <div className="col-md-6 col-sm-12">
                <div className="vision-img">
                  <figure>
                    <img src="/images/mission-img2.png" alt="Construction site" />
                  </figure>
                </div>
              </div>
            </div>

            <h3>Our Mission</h3>
            <p>
              We deliver with integrity and precision, guided by transparency, accountability, equity, and efficiency.
            </p>

            <div className="row">
              <div className="col-md-6 col-sm-12">
                <div className="vision-img">
                  <figure>
                    <img src="/images/our-core.png" alt="Team celebrating success" />
                  </figure>
                </div>
              </div>
              <div className="col-md-6 col-sm-12">
                <div className="core-value-box">
                  <h3>Our Core Values</h3>

                  <ul>
                    <li>Transparency</li>
                    <li>Accountability</li>
                    <li>Integrity</li>
                    <li>Efficiency</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="timiline-wrp">
        <div className="container">
          <div className="titlebar">
            <h2>
              Timeline at a <span>Glance</span>
            </h2>
          </div>

          <div className="timiline-box">
            <figure>
              <img src="/images/tineline-img.png" alt="Pasig City Hall timeline" />
            </figure>
          </div>

          <div className="timeline">
            <span className="timeline-label timeline-label-start timeline-label-complete">PROJECT START</span>
            {timelineEvents.map((event, index) => (
              <div
                key={`${event.date}-${index}`}
                className={`timeline-item ${
                  event.isComplete ? 'timeline-item-complete' : 'timeline-item-incomplete'
                }`}
              >
                <div className="timeline-content">
                  <span className="timeline-date">{event.date}</span>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
            <span className="timeline-label timeline-label-end timeline-label-incomplete">PROJECT END</span>
          </div>
        </div>
      </section>
      <style jsx>{`
        .timeline {
          position: relative;
          margin: 3rem auto 0;
          padding: 2rem 0;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .timeline::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 24px;
          width: 2px;
          background: #d1d5db;
        }

        .timeline-label {
          position: relative;
          padding-left: 64px;
          font-weight: 600;
          color: #2563eb;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 0.8rem;
        }

        .timeline-label-start {
          margin-top: -1rem;
        }

        .timeline-label-end {
          margin-bottom: -1rem;
        }

        .timeline-label::before {
          content: '';
          position: absolute;
          left: 17px;
          top: 50%;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
          transform: translateY(-50%);
        }

        .timeline-label-complete::before {
          background: #2563eb;
        }

        .timeline-label-incomplete::before {
          background: #fff;
        }

        .timeline-item {
          position: relative;
          padding-left: 64px;
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          top: 1.25rem;
          left: 18px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
        }

        .timeline-item:last-of-type {
          margin-bottom: 0;
        }

        .timeline-item-complete::before {
          background: #2563eb;
        }

        .timeline-item-incomplete::before {
          background: #fff;
        }

        .timeline-content {
          background: #fff;
          border-radius: 0.75rem;
          padding: 1.25rem 1.5rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 20px 45px -25px rgba(17, 24, 39, 0.4);
        }

        .timeline-date {
          display: block;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          color: #2563eb;
          margin-bottom: 0.5rem;
        }

        .timeline-content p {
          margin: 0;
          color: #4b5563;
          line-height: 1.6;
        }

        @media (max-width: 576px) {
          .timeline {
            gap: 1.75rem;
          }

          .timeline::before {
            left: 18px;
          }

          .timeline-label,
          .timeline-item {
            padding-left: 56px;
          }

          .timeline-label::before {
            left: 11px;
          }

          .timeline-item::before {
            left: 12px;
          }
        }

        @media (prefers-color-scheme: dark) {
          .timeline::before {
            background: #374151;
          }

          .timeline-label {
            color: #60a5fa;
          }

          .timeline-label::before {
            background: #111827;
            border-color: #60a5fa;
            box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.15);
          }

          .timeline-label-complete::before {
            background: #60a5fa;
          }

          .timeline-label-incomplete::before {
            background: #fff;
          }

          .timeline-content {
            background: #111827;
            border-color: #1f2937;
            box-shadow: 0 20px 45px -25px rgba(15, 23, 42, 0.9);
          }

          .timeline-content p {
            color: #d1d5db;
          }

          .timeline-date {
            color: #60a5fa;
          }

          .timeline-item::before {
            background: #111827;
            border-color: #60a5fa;
            box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.2);
          }

          .timeline-item-complete::before {
            background: #60a5fa;
          }

          .timeline-item-incomplete::before {
            background: #fff;
          }

        }
      `}</style>
    </Layout>
  );
}
