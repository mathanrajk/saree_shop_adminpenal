import { useFetchAllProduct } from "../../hooks/query";
import SkeletonCard from "../../UI/SkeletonCard";
import TopicText from "../../UI/TopicText";
import { dummyData } from "../../utils/helper";
import Card, { type Product } from "./Card";

function AllProduct() {
  const { data = [], isLoading } = useFetchAllProduct();

  if (isLoading) {
    const dummydata = dummyData(10);
    return (
      <div>
        <TopicText topic="All Product" />
        <div className="product-grid">
          {dummydata.map((_: string, index: number) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopicText topic="All Product" />
      <div className="product-grid">
        {data.map((product: Product) => (
          <Card key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default AllProduct;
