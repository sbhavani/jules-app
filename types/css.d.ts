declare module "*.css" {
  interface IStyle {
    [className: string]: string;
  }
  const style: IStyle;
  export default style;
}
