import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Services' },
  { href: '/projects', label: 'Projects' },
];

export default function Layout({ children, title = 'pchcc.com.ph', description = 'Pasig City Hall Construction Consortium (PCHCC)' }) {
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const closeNav = () => setNavOpen(false);
    router.events.on('routeChangeComplete', closeNav);
    return () => {
      router.events.off('routeChangeComplete', closeNav);
    };
  }, [router.events]);

  const isActive = (path) => {
    if (path === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(path);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />
        <link rel="icon" href="/images/favicon.png" />
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/responsive.css" />
      </Head>
      <div className="main-wrpper">
        <header>
          <div className="container">
            <nav className="navbar navbar-expand-lg navbar-light">
              <Link href="/" className="navbar-brand">
                <img src="/images/logo@2x.png" alt="Pasig City Hall Construction Consortium logo" />
              </Link>
              <button
                className={`navbar-toggler${navOpen ? '' : ' collapsed'}`}
                type="button"
                aria-controls="NavbarToggle"
                aria-expanded={navOpen}
                aria-label="Toggle navigation"
                onClick={() => setNavOpen((current) => !current)}
              >
                <span className="navbar-toggler-icon" />
              </button>
              <div className={`collapse navbar-collapse${navOpen ? ' show' : ''}`} id="NavbarToggle">
                <div className="nav-row">
                  <ul className="navbar-nav">
                    {NAV_ITEMS.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`nav-link${isActive(item.href) ? ' active' : ''}`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer>
          <div className="container">
            <div className="footer-top">
              <h6>
                The New Pasig City Hall Construction project complies with DENR, DOLE, and LGU standards.
              </h6>

              <h3>We’d love to hear from you!</h3>

              <div className="footer-links-row">
                <div className="row">
                  <div className="col-md-3 col-sm-12">
                    <div className="cnt-rw">
                      <div className="contact-list">
                        <div className="cnt-blk-rw">
                          <figure>
                            <img src="/images/cnt-ic1.svg" alt="Phone icon" />
                          </figure>
                          <p>
                            Hotline <a href="tel:09995518770">0999-551-8770</a>
                          </p>
                        </div>

                        <div className="cnt-blk-rw">
                          <figure>
                            <img src="/images/cnt-ic2.svg" alt="Email icon" />
                          </figure>
                          <p>
                            Email <a href="mailto:info@pchcc.com.ph">info@pchcc.com.ph</a>
                          </p>
                        </div>
                      </div>

                      <div className="address-box">
                        <h4>Office Address</h4>
                        <p>Pasig City Hall Compound, Pasig City</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-5 col-sm-12">
                    <div className="quicklinks-row">
                      <div className="address-box">
                        <h4>Office Address</h4>
                        <p>Pasig City Hall Compound, Pasig City</p>
                      </div>
                      <div className="quicklinks">
                        <h4>Company</h4>

                        <ul>
                          <li>
                            <Link href="/about">About Us</Link>
                          </li>
                          <li>
                            <Link href="/services">Services</Link>
                          </li>
                          <li>
                            <Link href="/projects">Projects</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-12">
                    <div className="our-parnters">
                      <h4>Our Founding Partners</h4>

                      <ul>
                        <li>
                          <a href="#">Philjaya Property Management Corporation</a>
                        </li>
                        <li>
                          <a href="#">Sta. Clara International Corporation</a>
                        </li>
                        <li>
                          <a href="#">Bandar Hebat Builders, Inc.</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="social-bx">
              <a href="#" target="_blank" rel="noreferrer">
                <figure>
                  <img src="/images/social-ic1.svg" alt="Facebook" />
                </figure>
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                <figure>
                  <img src="/images/social-ic2.svg" alt="LinkedIn" />
                </figure>
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                <figure>
                  <img src="/images/social-ic3.svg" alt="Twitter" />
                </figure>
              </a>
              <a href="#" target="_blank" rel="noreferrer">
                <figure>
                  <img src="/images/social-ic4.svg" alt="Instagram" />
                </figure>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
