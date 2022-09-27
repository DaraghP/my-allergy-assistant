# School of Computing &mdash; Year 4 Project Proposal Form

## SECTION A

|                     |                                                                                      |
|---------------------|--------------------------------------------------------------------------------------|
|Project Title:       | Intelligent Allergy Assistant - Android app to scan food ingredients for allergens.  |
|Student 1 Name:      | George Eskander                                                                      |
|Student 1 ID:        | 19451972                                                                             |
|Student 2 Name:      | Daragh Prizeman                                                                      |
|Student 2 ID:        | 19459734                                                                             |
|Project Supervisor:  | Paul Clarke                                                                          |

<!-- > Ensure that the Supervisor formally agrees to supervise your project; this is only recognised once the
> Supervisor assigns herself/himself via the project Dashboard.
>
> Project proposals without an assigned
> Supervisor will not be accepted for presentation to the Approval Panel.

## SECTION B

> Guidance: This document is expected to be approximately 3 pages in length, but it can exceed this page limit.
> It is also permissible to carry forward content from this proposal to your later documents (e.g. functional
> specification) as appropriate.
>
> Your proposal must include *at least* the following sections.
-->
### Introduction
> #### Describe the general area covered by the project.
>
> Food allergies can cause allergic reactions of varying severity. Some people may experience a tingling mouth, swelling, sweating, or a rash.
> Sometimes people can experience a more severe allergic reaction called Anaphylaxis, where the swelling in the throat causes the airways to constrict and people struggle to breathe.
>
> For this reason, people with food allergies must be very careful when shopping for food, and consuming food products in order to avoid their allergens.
> Some may struggle reading the ingredients on the back of packaging. This can turn an everyday task, like shopping for food, into a very daunting and stressful situation for people.
> The aim of our project is to assist these people and make their everyday lives less stressful with the help of our 'Intelligent Allergy Assistant' app.
>
> The target audience of this app is people with allergies, have trouble reading through ingredients, and anyone else who wants to ensure that food ingredients don't contain allergens
> 
> We will refer to sources such as these to identify a list of known food allergens:
> * [Food Safety Authority of Ireland's website](https://www.fsai.ie/legislation/food_legislation/food_information/14_allergens.html)
> * [InformAll](https://farrp.unl.edu/resources/gi-fas/informall)
> * [Food Allergy Research and Education (FARE)](https://www.foodallergy.org/living-food-allergies/food-allergy-essentials/common-allergens/other-food-allergens)
>
> Statistics:
>  * ["In Ireland, statistics show that approximately 5% of children and 3% of adults suffer from food allergies."](https://www.indi.ie/diseases,-allergies-and-medical-conditions/food-allergy-and-intolerance/383-food-allergies-and-intolerances-factsheet.html)
>  * ["In Ireland, one in six adults struggle with understanding basic written text."](https://www.nala.ie/literacy-and-numeracy-in-ireland/)
> 

### Outline
> #### Outline the proposed project.
>
>
> Our proposed project is to create an Android app that will act as an intelligent assistant for people with allergies, using AWS Lambda for our backend and React Native for our frontend.
> This app will allow users to create an account and store their allergen information, which would then be used to search for matches found in a scanned product's ingredients.
>
> There will be two methods which users can use to check if a product contains any of their allergens.
> 1. __Scan ingredients__ <br/>
     Users will be able to take or select a picture of the ingredients found on food packaging.
     Our app will then scan the ingredients for matches to the user's allergens, using text recognition and Google Translate API or similar.
     <br/> <br/>
> 2. __Scan barcode__ <br/>
     Users can take or select a picture of the product's barcode. Our app will then identify the product from the unique barcode if available and tell the user if the food is safe to eat, which allergens the product contains if any, more information may be provided such as nutrition through using the barcode using Open Food Facts API or similar. By scanning the barcode, users can also see if that product was previously reported by another user who experienced an allergic reaction, where their allergen was not listed in the ingredients.
>
> The app will also have a report feature, where users who experience an allergic reaction after consuming a product that didn't list the allergen in the ingredients,
> can scan the barcode found on the packaging and report the product, which will send an alert to other users who also scan that product in the future.
>
>
### Background

> The main idea for this project came from our supervisor, Paul Clarke, you can find the idea listed on https://computing.dcu.ie/~pclarke/ProjectIdeas/index.html
>
> Over the summer we were both sending each other project ideas back and forth. Until we came across this ‘Intelligent Allergy Assistant’ idea on Paul Clarke’s website. We were both interested in this idea, did some research into text recognition, and decided to set up a meeting with Paul to discuss the idea more and to become our supervisor for this project.

### Achievements

> #### What functions will the project provide? Who will the users be?
>
> The users of this app will be anyone with allergies or anyone who wants to ensure that a food product doesn't contain allergens.
> This app will provide users with a quick and easy method of checking if a food product is safe to eat, taking their allergens into account.
> The aim of this project is to make buying products less tedious, worrisome, and more accessible for people with allergies, and to keep people informed about the products they are buying.
>
### Justification
> #### Why/when/where/how will it be useful?
>
> The main use-case where we foresee this app being useful is for people with allergies while in the supermarket for example.
> If they are unsure if a particular product is safe for them to eat, they can simply scan the ingredients or barcode on the product packaging, and the app will tell them if the product contains any of their allergens and if anybody has reported this product for containing any unlisted allergens.
>
> Another use-case where this app would be useful is if you are abroad in Spain, for example and all the ingredients are listed in Spanish which you don't speak. Using our 'Intelligent Allergy Assistant', you can simply scan the ingredients on the product packaging, and the app will translate the ingredients and tell you if it contains any of your allergens.
>
> Another use-case where this app would be useful, is somebody who has an allergic reaction to peanuts after eating a chocolate bar, where peanuts weren't listed in the ingredients of the chocolate bar. This person could then use our app to report and warn other users about the unlisted allergen in the product, to prevent others from getting an allergic reaction.


### Programming language(s)

> #### List the proposed language(s) to be used.
>
> * JavaScript/TypeScript
> * Java
> * Python
> * SQL
>
>
### Programming tools / Tech stack

> Describe the compiler, database, web server, etc., and any other software tools you plan to use.
>
>
> #### We plan to use: <br/>
> *  React Native
> *  React Native CLI or Expo
> *  AsyncStorage or similar for storing app data locally
> *  AWS Lambda
> *  AWS tools such as DynamoDB
> *  Google Cloud tools such as Google Translate API
> *  Docker
> *  Git
> *  Gitlab Pipelines or similar
> *  Jest or similar, for testing
> *  Redux
> *  Open Food Facts API or similar, to identify a product from its unique barcode.
> *  Tesseract or Google Cloud Vision API OCR or similar to recognise text from an image.
> *  Android Emulator, to run the app while in development
> *  JetBrains IDEs, Code with Me, Visual Studio Code, LiveShare to work together in real-time in the same development environment (Pair-Programming)<br/>
> *  react-native-vision-camera or similar, to allow users to take a photo within our app
> *  Dynamsoft barcode reader or similar
>
### Hardware

> #### Describe any non-standard hardware components which will be required.
>
> As this project is an Android app, there are no special hardware requirements.
>
> An Android phone or emulator will be used to run the app.

### Learning Challenges

> #### List the main new things (technologies, languages, tools, etc) that you will have to learn.
>
> * AWS Lambda is a new technology to both of us, that we will learn throughout the duration of this project,
> * OCR/Text Recognition
> * Machine learning or data analysis potentially
> * Using or manipulating images in a mobile app
> * Working with barcodes
> * Implementing CI/CD in a project
> * Jest, for testing frontend potentially
> * React Native CLI


### Breakdown of work

>We plan to mostly use a pair-programming approach throughout the development of this project, as we found that this approach worked well last year for our third year project. 
> We both have experience using JetBrains “Code With Me” feature and Visual Studio Code’s “LiveShare” feature which allows us to work collaboratively in the same workspace in real-time.
> 
> We will work independently, from time to time on documentation, testing, and development if we feel it would be better to break up the work, or if one person is unavailable.
> This independent work will then be peer-reviewed by the other person to ensure we are both happy with it.
>
>For the documentation related to this project, we will work together using Google Docs, Code with Me, and LiveShare, so we can read and edit each other’s work in real-time. 
>
>We both have experience with React Native as we used it last year to create an Android app for our 3rd year project.
>Neither of us have experience working with implementing text recognition, barcodes, machine learning (potentially), and AWS Lambda but we will work together to learn these technologies as the project progresses.
>
>From now until week 9 in semester 1, we will be working together on the Functional Specification for this project. We will also be researching the new technologies needed for this project, and getting started with some coding. We plan to set up the backend with AWS Lambda, and the frontend in React Native, and create some API that deals with allergen data and other app data as appropriate.
>
> We aim to build a basic working prototype early, and then we will improve the UI and functionality from that point.
>We plan to put CI/CD in action early, so we can see the benefit from it as the project unfolds.
>We will commit our work to our Gitlab repository regularly throughout the duration of this project.