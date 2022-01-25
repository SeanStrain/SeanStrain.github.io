<link href="Stylesheets/contact.css" rel="stylesheet">
# Contact Me

If you would like to get in touch about receiving my CV or any other enquiries, please fill in the form below and I will get back to you as soon as I can.

<div class="contact-form-body">
    <form name="email-form" id="email-form" enctype="text/plain" action="#" target="hidden_iframe" onsubmit="submitted=true;">

      <h2>Contact Form:</h2>
      <h3 for="Name" class="label">Your Name or Organisation:</h3>
      <input size=35 type="text" placeholder="John Doe" id="name" name="name" data-resizable="true" required/>
      <br><br>
      <h3 for="Name" class="label">Your Email Address:</h3>
      <input size=35 type="email" placeholder="example@mail.com" id="email" name="email" data-resizable="true" required/>
      <br><br>
      <h3 for="Name" class="label">Subject:</h3>
      <input size=35 type="text" placeholder="Subject" id="subject" name="subject" data-resizable="true" required/>
      <br><br>
      <h3 for="Name" class="label">Your Message:</h3>
      <textarea style="width:90%; height:180px" placeholder="Begin typing..." id="message" name="message" maxlength=4000 data-resizable="true" required></textarea>
      <br>

      <div class="button">
        <button type="submit" id="contact-button" class="contact-button">Submit Message</button>
      </div>
  </form>
  <iframe name="hidden_iframe" id="hidden_iframe" style="display:none;" onload="if(submitted) {}"></iframe>
</div>

<script type="text/javascript">
function resizeTextarea (id) {
  Console.log("resizing")
  var a = document.getElementById(id);
  a.style.height = 'auto';
  a.style.height = a.scrollHeight+'px';
}

function init() {
  Console.log("Init")
  var a = document.getElementsByTagName('textarea');
  for(var i=0,inb=a.length;i<inb;i++) {
     if(a[i].getAttribute('data-resizable')=='true')
      resizeTextarea(a[i].id);
  }
}

addEventListener('DOMContentLoaded', init);
</script>

<script type="text/javascript">var submitted=false;</script>

<script type="text/javascript">
  $('#email-form').submit(function(e)
  {
    e.preventDefault();

    var name    = $('#name').val();
    var email   = $('#email').val();
    var subject = $('#subject').val();
    var message = $('#message').val();

    var data =
    {
      'entry.302269834':  name,
      'entry.681488958':  email,
      'entry.1008843732': subject,
      'entry.2052522880': message
    };

    var validRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!validRegex.test(email))
    {
      alert("Please enter a valid email address.")
    }
    else
    {
      $.ajax({
          url: 'https://docs.google.com/forms/d/e/1FAIpQLSec2vzBLeHU8GBc-FuUGA_ThzVGXdpHu6Zj9nI75_gUDaa1sQ/formResponse?',
          type: 'post',
          data: data,
          crossDomain: true,
          dataType: 'jsonp',
          success:function(){}
      });
    }
    $('#email-form *').fadeOut(2000);
    setTimeout( function() { $('#email-form').prepend('Your message has been processed. I will be in touch as soon as I can.')}, 1800);
  });
</script>
