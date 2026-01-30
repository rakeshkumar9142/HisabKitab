exports.generateReceiptText = (bill) => {
    let text = "";
    text += "HISABKITAB\n";
    text += "--------------------------\n";
  
    bill.items.forEach((i) => {
      text += `${i.name}  ${i.quantity} x ${i.price} = ${i.subtotal}\n`;
    });
  
    text += "--------------------------\n";
    text += `TOTAL: ₹${bill.totalAmount}\n\n`;
    text += "Thank you!\n\n";
  
    return text;
  };
  