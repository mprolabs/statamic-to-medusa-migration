import ProductDetail from '../../../components/ProductDetail';

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = params;

  return (
    <main>
      <ProductDetail slug={slug} />
    </main>
  );
}
