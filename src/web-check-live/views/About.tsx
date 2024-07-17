import styled from '@emotion/styled';

import colors from 'web-check-live/styles/colors';
import Heading from 'web-check-live/components/Form/Heading';
import Footer from 'web-check-live/components/misc/Footer';
import Nav from 'web-check-live/components/Form/Nav';
import Button from 'web-check-live/components/Form/Button';
import AdditionalResources from 'web-check-live/components/misc/AdditionalResources';
import { StyledCard } from 'web-check-live/components/Form/Card';
import docs, { about, featureIntro, license, fairUse, supportUs } from 'web-check-live/utils/docs';

const AboutContainer = styled.div`
width: 95vw;
max-width: 1000px;
margin: 2rem auto;
padding-bottom: 1rem;
header {
  margin 1rem 0;
  width: auto;
}
section {
  width: auto;
  .inner-heading { display: none; }
}
`;

const HeaderLinkContainer = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  a {
    text-decoration: none;
  }
`;

const Section = styled(StyledCard)`
  margin-bottom: 2rem;
  overflow: clip;
  max-height: 100%;
  section {
    clear: both;
  }
  h3 {
    font-size: 1.5rem;
  }
  hr {
    border: none;
    border-top: 1px dashed ${colors.primary};
    margin: 1.5rem auto;
  }
  ul {
    padding: 0 0 0 1rem;
    list-style: circle;
  }
  a {
    color: ${colors.primary};
    &:visited { opacity: 0.8; }
  }
  pre {
    background: ${colors.background};
    border-radius: 4px;
    padding: 0.5rem;
    width: fit-content;
  }
  small { opacity: 0.7; }
  .contents {
    ul {
      list-style: none;
      li {
        a {
          // color: ${colors.textColor};
          &:visited { opacity: 0.8; }
        }
        b {
          opacity: 0.75;
          display: inline-block;
          width: 1.5rem;
        }
      }
    }
  }
  .example-screenshot {
    float: right; 
    display: inline-flex;
    flex-direction: column;
    clear: both;
    max-width: 300px;
    img {
      float: right;
      break-inside: avoid;
      max-width: 300px;
      // max-height: 30rem;
      border-radius: 6px;
      clear: both;
    }
    figcaption {
      font-size: 0.8rem;
      text-align: center;
      opacity: 0.7;
    }
  }
`;

const SponsorshipContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  line-height: 1.5rem;
  img {
    border-radius: 4px;
  }
`;

const makeAnchor = (title: string): string => {
  return title.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, "-");
};

const About = (): JSX.Element => {
  return (
    <div>
    <AboutContainer>
      <Nav>
        <HeaderLinkContainer>
          <a target="_blank" rel="noreferrer" href="https://github.com/lissy93/web-check"><Button>View on GitHub</Button></a>
        </HeaderLinkContainer>
      </Nav>

      <Heading as="h2" size="medium" color={colors.primary}>Intro</Heading>
      <Section>
        {about.map((para, index: number) => (
          <p key={index}>{para}</p>
        ))}
        <hr />
        <SponsorshipContainer>
          <p>
            Web-Check is kindly sponsored
            by <a target="_blank" rel="noreferrer" href="https://terminaltrove.com/?utm_campaign=github&utm_medium=referral&utm_content=web-check&utm_source=wcgh">
              Terminal Trove
            </a>
            <br />
            The $HOME of all things in the terminal.
            <br />
            <small>
              <a target="_blank" rel="noreferrer" href="https://terminaltrove.com/newsletter?utm_campaign=github&utm_medium=referral&utm_content=web-check&utm_source=wcgh">
                Find your next CLI / TUI tool, and get updates to your inbox
              </a>
            </small>
          </p>
          <a target="_blank" rel="noreferrer" href="https://terminaltrove.com/?utm_campaign=github&utm_medium=referral&utm_content=web-check&utm_source=wcgh">
            <img width="300" alt="Terminal Trove" src="https://i.ibb.co/T1KzVmR/terminal-trove-green.png" />
          </a>
        </SponsorshipContainer>
        <hr />
        <p>
          Web-Check is developed and maintained by <a target="_blank" rel="noreferrer" href="https://aliciasykes.com">Alicia Sykes</a>.
          It's licensed under the <a target="_blank" rel="noreferrer" href="https://github.com/Lissy93/web-check/blob/master/LICENSE">MIT license</a>,
          and is completely free to use, modify and distribute in both personal and commercial settings.<br />
          Source code and self-hosting docs are available on <a target="_blank" rel="noreferrer" href="https://github.com/lissy93/web-check">GitHub</a>.
          If you've found this service useful, consider <a target="_blank" rel="noreferrer" href="https://github.com/sponsors/Lissy93">sponsoring me</a> from $1/month,
          to help with the ongoing hosting and development costs.
        </p>
      </Section>
      
      <Heading as="h2" size="medium" color={colors.primary}>Features</Heading>
      <Section>
        {featureIntro.map((fi: string, i: number) => (<p key={i}>{fi}</p>))}
        <div className="contents">
        <Heading as="h3" size="small" id="#feature-contents" color={colors.primary}>Contents</Heading>
          <ul>
            {docs.map((section, index: number) => (
              <li key={index}>
                <b>{index + 1}</b>
                <a href={`#${makeAnchor(section.title)}`}>{section.title}</a></li>
            ))}
          </ul>
          <hr />
        </div>
        {docs.map((section, sectionIndex: number) => (
          <section key={section.title}>
            { sectionIndex > 0 && <hr /> }
            <Heading as="h3" size="small" id={makeAnchor(section.title)} color={colors.primary}>{section.title}</Heading>
            {section.screenshot &&
              <figure className="example-screenshot">
                <img className="screenshot" src={section.screenshot} alt={`Example Screenshot ${section.title}`} />
                <figcaption>Fig.{sectionIndex + 1} - Example of {section.title}</figcaption>
              </figure> 
            }
            {section.description && <>
              <Heading as="h4" size="small">Description</Heading>
              <p>{section.description}</p>
            </>}
            { section.use && <>
              <Heading as="h4" size="small">Use Cases</Heading>
              <p>{section.use}</p>
            </>}
            {section.resources && section.resources.length > 0 && <>
              <Heading as="h4" size="small">Useful Links</Heading>
              <ul>
                {section.resources.map((link: string | { title: string, link: string }, linkIndx: number) => (
                  typeof link === 'string' ? (
                    <li key={`link-${linkIndx}`} id={`link-${linkIndx}`}><a target="_blank" rel="noreferrer" href={link}>{link}</a></li>
                  ) : (
                    <li key={`link-${linkIndx}`} id={`link-${linkIndx}`}><a target="_blank" rel="noreferrer" href={link.link}>{link.title}</a></li>
                  )
                ))}
              </ul>
            </>}
          </section>
        ))}
      </Section>

      <Heading as="h2" size="medium" color={colors.primary}>Deploy your own Instance</Heading>
      <Section>
        <p>Web-Check is designed to be easily self-hosted.</p>
        <Heading as="h3" size="small" color={colors.primary}>Option #1 - Netlify</Heading>
        <p>Click the button below to deploy to Netlify</p>
        <a target="_blank" rel="noreferrer" href="https://app.netlify.com/start/deploy?repository=https://github.com/lissy93/web-check">
          <img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify" />
        </a>

        <Heading as="h3" size="small" color={colors.primary}>Option #2 - Vercel</Heading>
        <p>Click the button below to deploy to Vercel</p>
        <a target="_blank" rel="noreferrer" href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flissy93%2Fweb-check&project-name=web-check&repository-name=web-check-fork&demo-title=Web-Check%20Demo&demo-description=Check%20out%20web-check.xyz%20to%20see%20a%20live%20demo%20of%20this%20application%20running.&demo-url=https%3A%2F%2Fweb-check.xyz&demo-image=https%3A%2F%2Fraw.githubusercontent.com%2FLissy93%2Fweb-check%2Fmaster%2F.github%2Fscreenshots%2Fweb-check-screenshot10.png">
          <img src="https://vercel.com/button" alt="Deploy with Vercel" />
        </a>

        <Heading as="h3" size="small" color={colors.primary}>Option #3 - Docker</Heading>
        <p>
        A Docker container is published to <a target="_blank" rel="noreferrer" href="https://hub.docker.com/r/lissy93/web-check">DockerHub</a>
        <br />
        Run this command, then open <code>localhost:3000</code>
        <pre>docker run -p 3000:3000 lissy93/web-check</pre>
        </p>

        <Heading as="h3" size="small" color={colors.primary}>Option #4 - Manual</Heading>
        <pre>
        git clone https://github.com/Lissy93/web-check.git<br />
        cd web-check # Move into the project directory<br />
        yarn install # Install dependencies<br />
        yarn build # Build the app for production<br />
        yarn serve # Start the app (API and GUI)<br />
        </pre>

        <Heading as="h3" size="small" color={colors.primary}>Further Docs</Heading>
        <p>
          More detailed installation and setup instructions can be found in the
          GitHub repository - <a target="_blank" rel="noreferrer" href="https://github.com/lissy93/web-check#readme">github.com/lissy93/web-check</a>
        </p>

        <Heading as="h3" size="small" color={colors.primary}>Configuring</Heading>
        <p>
          There are some optional environmental variables you can specify to give you access to some additional Web-Checks.
          See the README for full list of options.
        </p>

        <ul>
          <li>
            <code>GOOGLE_CLOUD_API_KEY</code>
            : <a target="_blank" rel="noreferrer" href="https://cloud.google.com/api-gateway/docs/authenticate-api-keys">A Google API key</a>
            <i> Used to return quality metrics for a site</i>
          </li>
          <li>
            <code>REACT_APP_SHODAN_API_KEY</code>
            : <a target="_blank" rel="noreferrer" href="https://account.shodan.io/">A Shodan API key</a>
            <i> To show associated hosts for a domain</i>
          </li>
          <li>
            <code>REACT_APP_WHO_API_KEY</code>
            : <a target="_blank" rel="noreferrer" href="https://whoapi.com/">A WhoAPI key</a>
            <i> Allows for more comprehensive WhoIs records</i>
          </li>
        </ul>

      </Section>

      <Heading as="h2" size="medium" color={colors.primary}>API Documentation</Heading>
      <Section>
        {/* eslint-disable-next-line*/}
        <p>// Coming soon...</p>
      </Section>

      <Heading as="h2" size="medium" color={colors.primary}>Additional Resources</Heading>
      <AdditionalResources />

      <Heading as="h2" size="medium" color={colors.primary}>Support Us</Heading>
      <Section>
        {supportUs.map((para, index: number) => (<p dangerouslySetInnerHTML={{__html: para}} />))}
      </Section>

      <Heading as="h2" size="medium" color={colors.primary}>Terms & Info</Heading>
      <Section>
      <Heading as="h3" size="small" color={colors.primary}>License</Heading>
        <b>
          <a target="_blank" rel="noreferrer" href="https://github.com/lissy93/web-check">Web-Check</a> is distributed under the MIT license,
          © <a target="_blank" rel="noreferrer" href="https://aliciasykes.com">Alicia Sykes</a> { new Date().getFullYear()}
        </b>
        <br />
        <small>For more info, see <a target="_blank" rel="noreferrer" href="https://tldrlegal.com/license/mit-license">TLDR Legal → MIT</a></small>
        <pre>{license}</pre>
        <hr />
        <Heading as="h3" size="small" color={colors.primary}>Fair Use</Heading>
        <ul>
          {fairUse.map((para, index: number) => (<li>{para}</li>))}
        </ul>
        <hr />
        <Heading as="h3" size="small" color={colors.primary}>Privacy</Heading>
        <p>
        Analytics are used on the demo instance (via a self-hosted Plausible instance), this only records the URL you visited but no personal data.
        There's also some basic error logging (via a self-hosted GlitchTip instance), this is only used to help me fix bugs.
        <br />
        <br />
        Neither your IP address, browser/OS/hardware info, nor any other data will ever be collected or logged.
        (You may verify this yourself, either by inspecting the source code or the using developer tools)
        </p>
      </Section>
    </AboutContainer>
    <Footer />
    </div>
  );
}

export default About;
