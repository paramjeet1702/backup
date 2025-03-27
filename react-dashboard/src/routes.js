/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Emails from "layouts/emails";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import AgentDetails from "layouts/dashboard/components/Agents/AgentDetails";
import AgentConfiguration from "layouts/AgentConfiguration";
import Orchestration from "layouts/Orchestration";
import LangGraph_integration from "layouts/LangGraph_integration";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Messages",
    key: "emails",
    icon: <Icon fontSize="small">email</Icon>,
    route: "/messages",
    component: <Emails />,
  },

  {
    type: "collapse",
    name: "Agent Configuration",
    key: "AgentConfiguration",
    icon: <Icon fontSize="small">assistant</Icon>,
    route: "/AgentConfiguration",
    component: <AgentConfiguration />,
  },
  {
    type: "collapse",
    name: "Orchestration",
    key: "LangFlow",
    icon: <Icon fontSize="small">fence</Icon>,
    route: "/Orchestration",
    component: <Orchestration />,
  },
  {
    type: "collapse",
    name: "LangGraph_integration",
    key: "LangGraph_integration",
    icon: <Icon fontSize="small">assistant</Icon>,
    route: "/LangGraph_integration",
    component: <LangGraph_integration />,
  },
  // {
  //   type: "collapse",
  //   name: "Agent Details",
  //   key: "agent-details",
  //   route: "/agent/:name",
  //   component: <AgentDetails />, // New details page
  //   hidden: true, // Hides from sidebar
  // },
  // {
  //   type: "collapse",
  //   name: "Profile",
  //   key: "profile",
  //   icon: <Icon fontSize="small">person</Icon>,
  //   route: "/profile",
  //   component: <Profile />,
  // },
  // {
  //   type: "collapse",
  //   name: "Sign In",
  //   key: "sign-in",
  //   icon: <Icon fontSize="small">login</Icon>,
  //   route: "/authentication/sign-in",
  //   component: <SignIn />,
  // },
  // {
  //   type: "collapse",
  //   name: "Sign Up",
  //   key: "sign-up",
  //   icon: <Icon fontSize="small">assignment</Icon>,
  //   route: "/authentication/sign-up",
  //   component: <SignUp />,
  // },
];

export default routes;
