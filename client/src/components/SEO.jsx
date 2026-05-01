import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description }) => {
  const siteTitle = 'ShopHub';
  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const pageDescription =
    description ||
    'ShopHub — Your one-stop destination for quality products at great prices.';

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default SEO;
