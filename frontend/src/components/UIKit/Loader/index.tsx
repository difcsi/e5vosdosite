import { ReactComponent as Donci } from "assets/donci.svg";
const Loader = () => {
  return (
    <div className="text-center text-5xl text-bold">
      <div className="min-h-[125px]">
        <Donci className="animate-spin fill-gray-200 hover:fill-gray-50 max-h-[100px] mx-auto" />
      </div>
    </div>
  );
};
export default Loader;
