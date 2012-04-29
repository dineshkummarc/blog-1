Title: Writing non brittle cucumber tests
Author: Michael Lam
Date: April 29 2012

A few of my 7digital colleagues and I had a mini debate last week over the brittleness of cucumber tests.

## The argument against using cucumber

The argument against using cucumber tests for acceptance testing, as I understand it, was twofold:

*	The acceptance criteria given by the stakeholders rarely map well to the step definitions, and make for brittle tests that are hard to understand. What's the point of using natural language anyway?

*	The step definitions themselves are too often brittle as the page layouts change with time, and would result in brittle tests that are time intensive and a pain to maintain.

## My response

*The main point of my argument in return is that it's not the tool, but the craftsman wielding it who is to blame.*

The acceptance tests for 7digital.com used to be brittle. I did about a weeks worth of refactoring and tidy up, and they are now in my opinion easy and quick to maintain.

Here are my tips to make your cucumber tests non-brittle:

Use short scenarios that signify the intent of the user, rather than having detailed steps that contain the actions of the user. This makes for much shorter, readable and much more maintainable scenarios.

An example of a badly written scenario:

	Given the user clicks on "sign out"
	And the user clicks on "sign in"
	And the user enters "some-test@7digital.com" in the textbox labelled "email"
	And the user enters "" in the textbox labelled "password"
	And the user checks the checkbox labelled "terms and conditions"
	When the user clicks the button "sign in"
	Then the user should see the message "Please enter a password."

This is what I propose to be a much better scenario:

	When a user tries to sign in without supplying a password
	Then they should not be signed in
	And they should see a message informing them that they have not supplied a password

It is obvious that the second way of writing the scenario is shorter, more readable and much less susceptible to change. We are not trying to reuse steps by entering different step definition arguments. It is simple, and easy to change.


Remember that not everyone who cares about the tests is a developer. Natural language is very useful for QA's and product managers. Remember also that code writen by other developers is often much harder to understand - the one of the biggest issues that developers face are naming methods and variables to make them understandable, and the use of natural language negates this.

We should be aiming to write better step definition assertions that are less susceptible for maintenance as the page changes, and will fail fast with clear assertion failure messages if they are going to fail. There are quite a few holes to fall into. Whilst refactoring through the step definitions for 7digital.com, I found the following "code smells". I'll go into each of these and explain what is wrong with them, and the better alternative.


## Code smell 1: When checking that an element has a css class

Bad:

	find("#r-353302 add-success").visible?.should be_true

The suggestion that we are trying to assert that an element contains a css class means that we are uncertain whether that css class is present. If this assertion was to fail, it would take a long time to fail and be met with a nil reference error, which is not intuitive.

Good: 
	
	find("#r-353302")[:class].include?("add-success").should be_true

This is better because it looks for the class attribute of the element, and quickly asserts whether it is present or not.


## Code smell 2: When checking the value of the 1st item in a table

Bad: 

	item = find(:xpath, '//table[@id="downloads-list"]/tbody/tr[2]/td[3]/a')

This xpath is pretty horrific to decipher, and susceptible to brittleness if an extra column or row is added. It is not clear that the item that we want to check is the first item.

Good: 
	
	first_item = all("#downloads-list tbody td a.title")[0]

The use of css selectors is much easier to understand, and with better variable names and getting the first item of the array of links, it is much clearer what we are trying to acheive.


## Code smell 3: When checking for the presence of something

Bad: 
	
	page.has_content?("blah").should be_true

It's really unclear initially to most people why this approach is awful. Firstly, the page.has_content method in Capybara waits for the whole DOM to load before doing the assertion, so it is very slow. The second is that "blah" can appear anywhere on the page. I know we want to remove brittleness, but it would be better to introduce *some* more specificity here.

Good: 
	
	find("#some-element").text.include?("blah").should be_true

We're being clear in the example above about exactly what we're asserting - that a particular element includes the required text.


## Code smell 4: When checking for something that could appear more than once on a page

Bad:

	find("span.validation-msg").text.include?("some validation message").should be_true

The issue here is that there could well be further validation messages present or added in the future. The find method will only return the first element that Capybara finds that meets the selector. This is therefore brittle.

Good: 

	validation_messages = all(".validation-msg")
	validation_messages.any?{ | message | message.text == "some validation message" }.should be_true

We are instead getting all the validation messages, and checking that at least one of them has the required validation message.


## Code smell 5: When checking that something appears 10 times

Bad:

	page.should have_content('Release 01')
	page.should have_content('Release 02')
	page.should have_content('Release 03')
	page.should have_content('Release 04')
	page.should have_content('Release 05')
	page.should have_content('Release 06')
	page.should have_content('Release 07')
	page.should have_content('Release 08')
	page.should have_content('Release 09')
	page.should have_content('Release 10')

Here we are not even asserting that the item we are expecting appears ten times, it merely asserts that ten text elements appear somewhere on the page. There could well be more than ten, and text often is added or removed over time as requirements change. Again, the have_content method in Capybara is very slow due to waiting for the whole DOM to load in this case.

Good:

	number_of_expected_purchases = 10
	purchases = all("#downloads-list tbody td.trackdetails a.title")
	purchases.length.should == number_of_expected_purchases

This is a much better example. It is clear that we are expecting 10 items, and it is clear exactly what element we are looking for.

One final point I want to make is that we should stop being so DRY, and remove storing state in-between steps. In my experience, code reuse within step definitions, including techniques such as calling other steps from within steps, normally leads to brittleness, as changing one step definition could have multiple repercussions as other tests are affected. Step definitions should be as de-coupled from each other as possible.
