Title: Removing non determinism from our acceptance tests
Author: Michael Lam
Date: Mar 04 2012

The web dev team at 7digital has been on quite the journey with our acceptance tests: automated regression tests based upon acceptance criteria. All began in good faith 18 months ago with the start of a new project – to create a brand new 7digital website with a completely new codebase, look and feel.

## The drop in confidence that came with non-deterministic tests

The complexity of these tests grew over the course of the next few months. Data setup and data access within our step definitions was implemented using a mixture of ActiveRecord and a C# console application called *DatabasePopulator*. The tests were run in a load balanced environment called systest, and were effectively end-to-end tests that tested the functionality of all internal and third party apis we connected to also.

Our acceptance tests started failing increasingly for non-deterministic reasons. Many things were blamed for this; the systest environment being too slow, data access interference across concurrent acceptance tests runs, the Capybara framework not being able to click buttons, caching, unreliable internal apis, asynchronous behaviour and more. The truth was that no one quite knew why on earth the tests kept failing. This damaged the morale of the team, and acceptance tests were often ignored in development or very poorly written.

The state of the acceptance tests deteriorated to the point where the team was on the brink of removing them altogether, and leaving a small handful as smoke tests. They were taking up huge chunks of time that could be spent developing new features, and we had deadlines to meet.

## Discussions

We had discussions and meetings about what we wanted from these tests – what value did they give? The team argued somewhat, but the general consensus was that we were trying to test too much – doing end to end testing was not a good idea, and we should simply focus on testing logic.

End to end testing was not the goal. We decided we wanted our tests to tell us whether the code we had written as a team fulfilled the acceptance criteria. We ended up chasing our own tails by trying to test everything end to end. After all, it was not our teams responsibility to make sure that the apis we called did what they said. It was not our responsibility that the load balancer would always behave. The inter-connectedness of the shared databases underneath our internal shared apis left consistency of data out of our control. Each of these sub-systems we connected to and used each had their own unit, integration and acceptance tests, so why should we replicate them? Some argued that by stubbing out our api calls, how would we really know if it all really works? The team already had integration tests which checked the endpoints we stubbed, so we felt this was covered. We implemented a separate set of smoke tests, a small suite of end to end tests that tested happy paths that gave us confidence in interaction with outside systems, such as load balancer setup and purchase using test credit cards. These smoke tests were small in number and took only a few minutes to run, which meant that if they failed, they would fail fast, and could be rerun quickly as necessary if we felt the results were non-deterministic.

## A clear definition of what we want to achieve

From our discussions, we coined the term, *“Feature test”*, with the definition, *“Tests a piece of functionality against its specification. The tests should not cross boundaries outside of your control”*.

## Faster feedback

We isolated the tests that seemed most non-deterministic into their own build and vastly improved debugging feedback via the use of screenshots and html snapshots of failing steps. The screenshots provided immediate reasons for the failures – we were no longer blind men trying to describe an elephant to each other.

## Isolation

Over the course of the next few months, we isolated the tests as much as we could. We removed caching, we took our feature tests off systest and into its own isolated environment free from load-balancing and network slowdowns. We created stubs for our api calls, we removed active record and automated the data setup before each test run, and we implemented the use of disposable databases. The determinism of our tests soared, and the team gained confidence in them.

## The tests should be easy to run

We’ve spent time making the feature tests easier to run too. There is no longer any configuration or hard to remember command line parameters to remember. We’ve enabled our feature tests to be run from the Visual Studio Resharper test runner, and abstracted and automated all the configuration changes so anyone can run them.

## My list of top ten actions to improve determinism

Here is a list of things, in order, which any team should try and implement, if they wish to improve the determinism of their acceptance tests.

*	Get buy in from your whole team that automated acceptance testing is a good thing.
*	Obtain a clear goal of what you want to achieve from these tests, and a clear definition of their purpose.
*	Set aside time, a good few weeks, to tackle the issue.
*	Fast debugging please. Screenshots and html outputs of all failed steps.
*	Isolate, isolate, isolate. Isolate your environment, stub your api calls, turn off caching and load balancing (use separate tests to test load balancing), isolate your database, and isolate your browser used for testing.
*	Reduce network calls to a minimum. Have the tests run on the same box where they are deployed. The same goes for your stubs – the stubs should be deployed on the same box also so all requests are to localhost.
*	Data should be setup and torn down for each run.
*	The database should be disposable, allowing for isolation and concurrent builds.
*	Ability to watch your tests as they are run by your continuous integration environment.
*	When a test fails, is should fail quickly.
*	Make it easy for QAs to run them – they often have a lot more patience than developers and can spot problems that we can’t. No change of configuration should be required in order for the tests to be run.