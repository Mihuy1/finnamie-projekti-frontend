import "../styles/message-styles.css";
export const CListItem = ({ handleOpen, c, isSelected }) => {
  let style = "conv-list-entry";
  if (isSelected) style += " selected-clist-item";
  /*
  let style = { cursor: "pointer", padding: "4px" };
  if (isSelected) {
    style = {
      backgroundColor: "#ffffff",
      borderRadius: "0",
      padding: "0",
      margin: "0",
      ...style,
    };
  } */
  return (
    <p
      className={style}
      onClick={() => {
        handleOpen(c);
      }}
      //style={style}
    >
      {c.first_name} {c.last_name}
    </p>
  );
};
