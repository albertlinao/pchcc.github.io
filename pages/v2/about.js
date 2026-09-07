import Layout from '../../components/LayoutV2';

export default function AboutPageV2() {
  const timelineEvents = [
    {
      date: '13 January 2025',
      title: 'Contract Signing.',
      description:
        'The ceremonial contract signing for the Pasig City Hall complex marked the official start of one of the city’s most significant infrastructure projects.',
      image: null,
    },
    {
      date: 'February 2025',
      title: 'Demolition of the Old Pasig City Hall.',
      description:
        'The demolition of the old Pasig City Hall marked the first major step in preparing the site for the construction of a new government complex designed to serve future generations of Pasigueños.',
      image: null,
    },
    {
      date: '15 October 2025',
      title: 'Groundbreaking and Capsule-Laying.',
      description:
        'The groundbreaking and capsule-laying ceremony marked the official start of construction for the new Pasig City Hall Complex, reflecting Pasig City’s commitment to a smarter, greener, and people-centered future.',
      image: null,
    },
    {
      date: 'November 2025',
      title: 'Foundation Works Begin.',
      description:
        'Foundation works commenced as the project moved from planning to construction. Structural works began, laying the groundwork for the future City Hall complex.',
      image: null,
    },
    {
      date: 'December 2025',
      title: 'The Structure Begins to Take Shape.',
      description:
        'As construction progressed, the building’s structural framework began to emerge, signaling steady progress on site and bringing the project’s vision closer to reality.',
      image: null,
    },
    {
      date: '14 February 2026',
      title: 'First Concrete Pour.',
      description:
        'The ceremonial first concrete pour marked the start of major construction activities for the new Pasig City Hall Complex, laying the foundation for a modern and future-ready government center for Pasigueños.',
      image: null,
    },
    {
      date: 'March 2026',
      title: 'Structural Works Continue.',
      description:
        'Structural works continued across multiple levels, maintaining construction momentum, and advancing the development of the new City Hall.',
      image: null,
    },
    {
      date: 'April 2026',
      title: 'Structural Works and Slab Concreting.',
      description:
        'Construction activities continued with structural works and slab concreting, bringing the project closer to the completion of its primary structural framework.',
      image: null,
    },
    {
      date: '15 June 2026',
      title: 'Topping Off.',
      description:
        'The project reached a major milestone with the topping-off ceremony, marking the completion of the building’s primary structural framework and the transition to the next phase of construction.',
      image: null,
    },
  ];

  return (
    <Layout title="About Us | pchcc.com.ph">
      <section className="inner-banner-wrp">
        <div className="container">
          <div className="inner-banner-block">
            <h1>Who We Are</h1>
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

          <h3 className="tl-subhead">Major Milestones and Project Events</h3>

          <div className="tl">
            {timelineEvents.map((event, index) => (
              <div className="tl-row" key={`${event.date}-${index}`}>
                <span className="tl-pill">{event.date}</span>
                <div className="tl-combo">
                  <div className="tl-media">
                    {event.image ? (
                      <img src={event.image} alt={event.title.replace(/\.$/, '')} />
                    ) : (
                      <div className="tl-media-ph" aria-hidden="true">
                        <span className="tl-media-icon">📷</span>
                        <span className="tl-media-note">Photo</span>
                      </div>
                    )}
                  </div>
                  <div className="tl-caption">
                    <p>
                      <strong>{event.title}</strong> {event.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <style jsx>{`
        .tl-subhead {
          text-align: center;
          margin: 2.5rem 0 0;
          color: #111;
          font-size: 1.4rem;
          font-weight: 700;
        }

        .tl {
          position: relative;
          max-width: 940px;
          margin: 1rem auto 0;
          padding: 1.5rem 0 1rem;
        }

        /* oblong: elongated capsule outline running the length of the timeline */
        .tl::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 38px;
          transform: translateX(-50%);
          border: 4px solid #1c3f9c;
          border-radius: 19px;
          z-index: 0;
        }

        .tl-row {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 336px;
        }

        /* interleave the alternating sides into a zigzag */
        .tl-row + .tl-row {
          margin-top: -104px;
        }

        .tl-row:last-child {
          min-height: 232px;
        }

        /* image + writeup travel together, alternating sides of the oblong */
        .tl-combo {
          grid-column: 1;
          justify-self: end;
          margin-right: 24px;
          width: min(380px, 100%);
          display: flex;
          flex-direction: column;
          gap: 0.95rem;
          z-index: 1;
        }

        .tl-row:nth-child(even) .tl-combo {
          grid-column: 2;
          justify-self: start;
          margin-right: 0;
          margin-left: 24px;
        }

        .tl-media {
          width: 200px;
          height: 200px;
          align-self: flex-end;
        }

        .tl-row:nth-child(even) .tl-media {
          align-self: flex-start;
        }

        /* every image is clipped to the same circle, whatever its source ratio */
        .tl-media img,
        .tl-media-ph {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 0 0 4px #cfe0f7;
        }

        .tl-media-ph {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          background: #e8eff9;
          color: #7f9bc4;
        }

        .tl-media-icon {
          font-size: 2rem;
          line-height: 1;
        }

        .tl-media-note {
          font-size: 0.72rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .tl-caption p {
          margin: 0;
          color: #000;
          line-height: 1.55;
          font-size: 0.95rem;
        }

        .tl-caption strong {
          color: #000;
          font-weight: 700;
        }

        /* date pill sits on the oblong, offset toward the writeup side */
        .tl-pill {
          position: absolute;
          top: 100px;
          left: 50%;
          z-index: 2;
          white-space: nowrap;
          background: #2456c8;
          color: #fff;
          border-radius: 999px;
          padding: 0.42rem 1.15rem;
          font-size: 0.82rem;
          font-weight: 600;
        }

        .tl-row:nth-child(odd) .tl-pill {
          transform: translateX(-24%);
        }

        .tl-row:nth-child(even) .tl-pill {
          transform: translateX(-76%);
        }

        @media (max-width: 768px) {
          .tl {
            max-width: 480px;
            padding: 1.75rem 0;
          }

          .tl::before {
            left: 14px;
            width: 28px;
            border-radius: 14px;
            transform: none;
          }

          .tl-row,
          .tl-row:last-child {
            grid-template-columns: 1fr;
            min-height: 0;
            margin-bottom: 2.25rem;
            padding-left: 46px;
          }

          .tl-row + .tl-row {
            margin-top: 0;
          }

          .tl-combo,
          .tl-row:nth-child(even) .tl-combo {
            grid-column: 1;
            justify-self: start;
            margin: 0;
            width: 100%;
          }

          .tl-media,
          .tl-row:nth-child(even) .tl-media {
            align-self: flex-start;
            width: 132px;
            height: 132px;
          }

          .tl-pill,
          .tl-row:nth-child(odd) .tl-pill,
          .tl-row:nth-child(even) .tl-pill {
            position: static;
            transform: none;
            justify-self: start;
            align-self: flex-start;
            margin: 0 0 0.9rem;
          }
        }
      `}</style>
    </Layout>
  );
}
