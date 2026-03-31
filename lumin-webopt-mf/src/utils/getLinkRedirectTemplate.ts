export const getLinkToLuminPDF = ({
  id,
  slug,
}: {
  id: number;
  slug: string;
}) => {
  const queryString = new URLSearchParams({
    remoteId: id.toString(),
    formName: slug,
    from: "templates",
    source: "formtemplates",
  });
  return `http://localhost:3000/open-form?${queryString.toString()}`;
};

export const getLinkRedirectToLuminSign = (id: number) => {
  const path = `upload?remoteId=${encodeURIComponent(id)}&from=templates&source=library`;
  return ["http://localhost:3000", path].join("/");
};
