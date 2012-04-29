Title: Feature Switching
Author: Michael Lam
Date: Mar 25 2011


We have recently implemented feature switching in our [new 7digital site](http://www.7digital.com/). Feature switching is the ability to turn certain parts of the site on or off, either globally or individually for a particular international territory. Each feature has a flag in a database that can be set as required to perform the switch.
Each feature is a MVC partial view that is rendered via the Html.RenderAction helper method. These RenderActions display the response from a child action method in a controller. Normally, these child action methods return a PartialViewResult, which is then rendered using the MVC view engine.
If the child action method returns a null response, then the partial view is not rendered, thus the feature is “switched off”.
We wanted to separate the feature switching logic from our controller logic, and therefore we made an action filter to do the job for us. The OnActionExecuting method of an action filter is a hook that is executed before the controller method. This OnActionExecuting method has an ActionExecutingContext parameter which contains a Result property of type ActionResult. By setting the Result property, we can effectively bypass running any subsequent action filter and controller logic, and return the result given:

## The OnActionExecuting hook

<feature-switching/on-action-executing.txt>

If we do not set the Result property, then subsequent action filter and controller logic is executed as normal.


