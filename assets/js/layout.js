/* load pattern nav */
var template         = document.getElementById("pl-pattern-nav-template");
var templateCompiled = Hogan.compile(template.innerHTML);
var templateRendered = templateCompiled.render(navItems);
document.getElementById("pl-pattern-nav-target").innerHTML = templateRendered;