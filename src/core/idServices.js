class IdServices {
  generateId() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    let hasLetter = false;
    let hasNumber = false;

    while (id.length < 10) {
      const char = characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      id += char;
      if (/[A-Za-z]/.test(char)) hasLetter = true;
      if (/[0-9]/.test(char)) hasNumber = true;
    }

    if (!hasLetter) id = id.replace(/[0-9]/, "A");
    if (!hasNumber) id = id.replace(/[A-Za-z]/, "1");

    const now = new Date();
    //MDDYY
    const formattedDate = `${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}${now
      .getFullYear()
      .toString()
      .slice(-2)}`;
    return id + formattedDate;
  }
}

export default new IdServices();