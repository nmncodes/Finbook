import moment from 'moment'

export default function (
   { name,
      address,
      phone,
      email,
      dueDate,
      date,
      id,
      notes,
      subTotal,
      type,
      gst,
      total,
      items,
      status,
      totalAmountReceived,
      balanceDue,
      company,
   }) {
    const today = new Date();
return `<!DOCTYPE html>
<html>
<head>
<style>

body {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    width: 1000px;
    margin: 0px auto;
    }

table {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

table td, table th {
  border: 1px solid rgb(247, 247, 247);
  padding: 15px;
}

table tr:nth-child(even){background-color: #f8f8f8;}

table tr:hover {background-color: rgb(243, 243, 243);}

table th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #FFFFFF;
  color: rgb(78, 78, 78);
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;

}
.address {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    line-height: 12px;
    font-size: 15px;
    margin-top: -10px;

}

.contact {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status {
    text-align: right;
    margin-top: -200px;
}
.receipt-id {
    text-align: right;
}

.title {
    font-weight: 100px;
    text-transform: uppercase;
    color: gray;
    letter-spacing: 2px;
    font-size: 15px;
}

.summary {
    margin-top: 2px;
    margin-right: 0px;
    margin-left: 55%;
    margin-bottom: 50px;
}

img {
    width: 150px;
    padding-top: 100px;
}

</style>
</head>
<body>
<section  class="header">
        <div>
           <img src="https://i.postimg.cc/8PyXvBpC/Salesforce-com-logo-svg.png" />
        </div>
</section>
<section class="address">
    <div class="contact">
          <div>
          <h4>${company?.businessName || 'Company'}</h4>
          <p>${company?.email || ''}</p>
          <p>${company?.phoneNumber || ''}</p>
          <p>${company?.address || ''}</p>
      </div>

      <div>
          <p class="title">Bill to:</p>
          <h4>${name}</h4>
          <p>${email}</p>
          <p>${phone}</p>
          <p>${address}</p>
      </div>
    </div>

    <div class="status">
        <div class="receipt-id">
            <h1>${type}</h1>
            <p>#${id}</p>
        </div>
        <p class="title">Status</p>
        <h3>${status}</h3>
        <p class="title">Date</p>
        <p>${moment(date).format('Do MMM, YYYY')}</p>
        <p class="title">Amount</p>
        <h3>₹${total}</h3>
    </div>


</section>

<table>
  <tr>
    <th>Description</th>
    <th>Quantity</th>
    <th>Price</th>
    <th style="text-align: center">Amount</th>
  </tr>
  ${items.map(item => `
  <tr>
    <td>${item.itemName}</td>
    <td>${item.quantity}</td>
    <td>${item.unitPrice}</td>
    <td style="text-align: center">${(item.quantity * item.unitPrice) - (item.quantity * item.unitPrice) * item.discount / 100}</td>
  </tr>
  `).join('')}
</table>

<section class="summary">
    <table>
        <tr>
          <th>Summary</th>
          <th></th>
        </tr>
        <tr>
          <td>Total</td>
          <td style="text-align: center">₹${total}</td>
        </tr>

        <tr>
            <td>Payment made</td>
            <td style="text-align: center">₹${totalAmountReceived}</td>
          </tr>

        <tr>
            <td>Balance</td>
            <td ><h3 style="line-height: 5px; text-align: center">₹${balanceDue}</h3></td>
          </tr>
        
      </table>
</section>
<div>
    <hr>
    <h4>Note</h4>
    <p>${notes}</p>
</div>
</body>
</html>
`
;
};