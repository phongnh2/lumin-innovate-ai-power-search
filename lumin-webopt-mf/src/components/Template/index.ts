import Badge from "./Badge";
import Card from "./Card";
import Categories from "./Categories";
import DetailModal from "./DetailModal";
import Gallery from "./Gallery";
import Item from "./Item";
import Thumbnail from "./Thumbnail";

export { LUMIN_BADGES_TYPES } from "./Badge/constants";

export const Template: {
  Badge: typeof Badge;
  Card: typeof Card;
  Categories: typeof Categories;
  DetailModal: typeof DetailModal;
  Gallery: typeof Gallery;
  Item: typeof Item;
  Thumbnail: typeof Thumbnail;
} = {
  Badge,
  Card,
  Categories,
  DetailModal,
  Gallery,
  Item,
  Thumbnail,
};
