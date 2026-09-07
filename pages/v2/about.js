import Layout from '../../components/LayoutV2';
import Timeline from '../../components/Timeline';

export default function AboutPageV2() {
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

          <Timeline />
        </div>
      </section>
    </Layout>
  );
}
