Title: A framework for rapid application development of 7digital music stores
Author: Michael Lam
Date: May 27 2011

All 7digital music stores have similar functionality; it is often only the content, sitemap structure and styling which differs from one store to the next. Can the common elements of a 7digital music store therefore be abstracted into their own modular, reusable “functional parts”?

*If we can do so, can we then also produce a framework in which there is so little configuration required that a UI developer can create a 7digital music store without any need for a web developer to get involved?*

Ideally, all a UI developer would need to do to drop a piece of 7digital music store goodness into a site is to do something along these lines:

	<div>@RenderArtistCharts();</div>

It was important to me that each functional part should be its own assembly and encapsulate all of the services, IOC, routes and views required. I decided that the views themselves should be part of the functional part itself – HTML is after all structural content markup; it should not be used for layout or styling purposes.
Initially I looked at ways to build a custom MVC view engine that would take in views from different projects. From my initial research to see if anyone else had done anything similar, I found a perfect solution that the [MVCContrib project](http://mvccontrib.codeplex.com/) already provided: [MVC Portable Areas](http://portableareas.codeplex.com/).

The essence of portable areas is that it packages an MVC area into its own assembly.
Each portable area requires a class that derives from PortableAreaRegistration. MvcContrib automatically scans for and hooks up these portable areas by searching for this class. In this PortableAreaRegistration, we can define the Area Name and set up routes for our functional part.

<framework-for/portable-area.txt>

Setting up the portable areas was fairly easy, and I was soon creating portable areas for artist charts, artist details, release details and a basket, each with their own controllers, views and routes. I used the [7digital Api Wrapper](https://github.com/7digital/SevenDigital.Api.Wrapper) to consume the Api.
All that is required to use a functional part inside of a music store is a reference to the dll and the use of an HtmlHelper inside of a view. An example html helper for the basket functional part is as follows:


<framework-for/html-helper.txt>

Inside the 7digital music store view, all that is required to render the basket functional part is one line, which fulfils our original objective well.

	@Html.Basket()

## Ioc Registration Handling

One stumbling block I initially encountered was how to register the IOC dependencies of the “functional parts.” Firstly, I set up individual StructureMap registries for each functional part. Although this worked fine, I didn’t like this approach as it tied in the functional parts to referencing StructureMap, and this would make it very difficult to swap and change at a later date, going against the whole ethos of functional parts.
One thought I had was to use StructureMap’s auto scanning functionality, which would auto scan the functional parts and auto register by convention.
The approach I took though was for the music store itself to not reference an IOC container at all and for each functional part to expose its IOC registrations through an implementation of a custom interface. I made a new functional part IocRegistrations, with a single interface as follows. The first item in the tuple is for the interface type, and the second item is for the concrete type.

	namespace FunctionalParts.IocRegistrations
	{
    	public interface IIocRegistration
    	{
        	IEnumerable<Tuple<Type, Type>> IocRegistrations { get; } 
     	}
	}

Each functional part can implement this interface, and therefore choose how it’s dependencies should be resolved. One point to note: I have not yet implemented any way to control dependency binding lifetimes – but this should not be difficult by introducing a custom enums into the tuple:

	public interface IIocRegistration
	{
	      IEnumerable<Tuple<Type, Type, LifeTime>> IocRegistrations { get; } 
	}

The IOC Container itself is encapsulated within its own functional part, and uses reflection to scan through all implementations of IIocRegistration in all the referenced Functional Part assemblies, and then creates an instance of a StructureMap registry on the fly, which is added to the bootstrapper.

	public static class IocRegistries
	{
	    private const string FUNCTIONAL_PARTS_ASSEMBLY_PREFIX = "FunctionalParts.";
	 
	    public static Action<IInitializationExpression> FunctionalPartsIoc
	    {
	        get
	        {
	                 return x =>
	                               {
	                                   foreach (var iocRegistration in GetIocRegistrations())
	                                   {
	                                        x.AddRegistry(iocRegistration);
	                                   }
	                                };
	         }
	     }
	 
	     private static IEnumerable<Registry> GetIocRegistrations()
	     {
	           IEnumerable<Tuple<Type, Type>> functionalPartsIocRegistrations = GetFunctionalPartsIocRegistrations();
	 
	           foreach (var functionalPartsIocRegistration in functionalPartsIocRegistrations)
	           {
	                   Registry registry =  Activator.CreateInstance<Registry>();
	                   registry.ForRequestedType(functionalPartsIocRegistration.Item1).TheDefaultIsConcreteType(functionalPartsIocRegistration.Item2);
	                   yield return registry;
	           }
	      }
	 
	private static IEnumerable<Tuple<Type, Type>> GetFunctionalPartsIocRegistrations()
	      {
	            IEnumerable<Assembly> assemblies = AppDomain.CurrentDomain.GetAssemblies().Where(x =>  x.FullName.StartsWith(FUNCTIONAL_PARTS_ASSEMBLY_PREFIX));
	 
	            foreach (var assembly in assemblies)
	            {
	                  Type registryType = GetIocRegistryType(assembly);
	 
	                   if (registryType != null)
	                   {
	                               var instance = (IIocRegistration)Activator.CreateInstance(registryType);
	                               foreach (Tuple<Type, Type> iocRegistration in instance.IocRegistrations)
	                               {
	                                       yield return iocRegistration;
	                               }
	                     }
		       }
		}
	 
	       private static Type GetIocRegistryType(Assembly assembly)
	       {
	               return assembly.GetTypes()
	                       .SingleOrDefault(x => !x.IsInterface && typeof(IIocRegistration).IsAssignableFrom(x));
	       }
	}

By doing this, the music store doesn’t need to know anything about how to hook up functional part dependencies, as each one takes care of itself. All the music store needs to do is to reference the IocBootstrapper functional part and call the Bootstrap method on Application_Start():

	protected void Application_Start()
	{
	       AreaRegistration.RegisterAllAreas();
	       IocBootstrapper.Bootstrap();
	       RegisterGlobalFilters(GlobalFilters.Filters);
	       RegisterRoutes(RouteTable.Routes);
	}

## So what does the framework look like in Visual Studio?

This is what an individual functional part looks like, encapsulating controllers, services, html helpers, routes, IoC registration (without needing to reference an IOC container) and MVC portable area registration:

![An individual functional part](framework-for/funcpart.png "An individual functional part")

## So, Did this all work?

I’m glad to say it has worked very well so far. The example site made with this framework can be viewed here: [Functional Parts Demo](http://functionalparts.apphb.com/) 

*[Edit 2012.04.29: Due to changes in the 7digital API schema, the demo is currently not working.]*


The code is available for perusal at Github: [SevenDigital-Functional-Parts-Spike](https://github.com/treadsafely/SevenDigital-Functional-Parts-Spike)

## How to take it further

Each functional part assembly can be it’s own [nu-get package](http://nuget.codeplex.com/), so package management is handled really well.
Different layouts of the functional parts may require different templates, and this may require a means for the consuming store to be able to define a template when using the html helper:

	@Html.Basket("two-column-template")
	
I would like to make additional functional parts that demonstrate paging, user authentication and checkout. Some of this extra functionality may require working on the SevenDigital.Api.Wrapper if it is not there already.
A visual studio template can also be made with an installer, so we can quickly add new functional parts.
More example stores can be made to show how templates and css can be utilised on the same functional part, yet be realised with a very different look and feel.
Binding lifetimes can be handled in the IOCRegistrations interface, allowing functional parts to depict the binding lifetime of their dependencies.
