import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout title="pchcc.com.ph">
      <section className="hero-banner">
        <div className="container">
          <div className="banner-block">
            <div className="row">
              <div className="col-md-6 col-sm-12">
                <div className="banner-data">
                  <h1>
                    A Future-Ready Pasig City<br />
                    Begins Here
                  </h1>
                  <p>
                    The Pasig City Hall Construction Consortium (PCHCC) is building a world-class, sustainable, and future-proof
                    city hall for the people of Pasig.
                  </p>

                  <Link href="/about" className="btn-main">
                    Learn more
                    <figure>
                      <img src="/images/right-ar-white.svg" alt="Arrow" />
                    </figure>
                  </Link>
                </div>
              </div>
              <div className="col-md-6 col-sm-12">
                <div className="banner-img">
                  <figure>
                    <img src="/images/banner-img.png" alt="Illustration of the Pasig City Hall vision" />
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="consortium-wrp">
        <div className="container">
          <div className="titlebar">
            <h2>
              Consortium <span>Members</span>
            </h2>
          </div>

          <div className="consortium-slider">
            <div className="consortium-block">
              <div className="consortium-box">
                <div className="consortium-logo">
                  <figure>
                    <img src="/images/mem-logo2@2x.png" alt="Sta. Clara International Corporation logo" />
                  </figure>
                </div>

                <div className="consortium-data">
                  <p>Sta. Clara International Corporation (SCIC)</p>
                </div>

                <a href="https://staclara.com.ph/" target="_blank" rel="noreferrer" className="btn-main">
                  Learn more
                  <figure>
                    <img src="/images/right-ar-white.svg" alt="Arrow" />
                  </figure>
                </a>
              </div>
            </div>
            <div className="consortium-block">
              <div className="consortium-box">
                <div className="consortium-logo">
                  <figure>
                    <img src="/images/mem-logo3@2x.png" alt="Bandar Hebat Builders logo" />
                  </figure>
                </div>

                <div className="consortium-data">
                  <p>Bandar Hebat Builders, Inc. (BHBI)</p>
                </div>
                <a href="https://www.bandarhebatbuilders.com/" target="_blank" rel="noreferrer" className="btn-main">
                  Learn more
                  <figure>
                    <img src="/images/right-ar-white.svg" alt="Arrow" />
                  </figure>
                </a>
              </div>
            </div>
            <div className="consortium-block">
              <div className="consortium-box">
                <div className="consortium-logo">
                  <figure>
                    <img src="/images/mem-logo1@2x.png" alt="Philjaya Property Management Corporation logo" />
                  </figure>
                </div>

                <div className="consortium-data">
                  <p>Philjaya Property Management Corporation (PPMC)</p>
                </div>

                <a href="https://philjaya.mtdphilippines.com/" target="_blank" rel="noreferrer" className="btn-main">
                  Learn more
                  <figure>
                    <img src="/images/right-ar-white.svg" alt="Arrow" />
                  </figure>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
