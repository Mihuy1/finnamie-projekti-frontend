import { useParams } from "react-router-dom";

export const Success = () => {
  const { res_id } = useParams();
  console.log(res_id);
  return <h1>Payment successfull</h1>;
};
