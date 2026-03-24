import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Order "mo:core/Order";

import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  // External Blob Storage
  include MixinStorage();

  // Access Control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type User = {
    name : Text;
    email : Text;
    role : {
      #subscriber;
      #admin;
    };
    subscriptionActive : Bool;
    selectedCharityId : ?Nat;
    charityContributionPercent : Nat;
    golfScores : [GolfScore];
  };

  module User {
    public func compare(u1 : User, u2 : User) : Order.Order {
      switch (Text.compare(u1.name, u2.name)) {
        case (#equal) { Text.compare(u1.email, u2.email) };
        case (order) { order };
      };
    };
  };

  public type GolfScore = {
    score : Nat;
    dateText : Text;
  };

  public type Charity = {
    id : Nat;
    name : Text;
    description : Text;
    featured : Bool;
    eventsList : [Text];
  };

  module Charity {
    public func compare(c1 : Charity, c2 : Charity) : Order.Order {
      Text.compare(c1.name, c2.name);
    };
  };

  public type DrawStatus = {
    #pending;
    #simulated;
    #published;
  };

  public type DrawLogic = {
    #random;
    #algorithmic;
  };

  public type Draw = {
    id : Nat;
    drawDate : Int;
    winningNumbers : [Nat];
    prizePool : Nat;
    jackpot : Nat;
    status : DrawStatus;
    drawLogic : DrawLogic;
  };

  public type Winner = {
    userId : Principal;
    drawId : Nat;
    matchCount : Nat;
    prizeAmount : Nat;
    paymentStatus : {
      #pending;
      #paid;
    };
    proofBlobId : ?Text;
  };

  // Storage
  let userProfiles = Map.empty<Principal, User>();
  let charities = Map.empty<Nat, Charity>();
  let draws = Map.empty<Nat, Draw>();
  let winners = Map.empty<Nat, Winner>();

  var nextCharityId = 1;
  var nextDrawId = 1;

  // Payment Integration
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  // User Management
  public shared ({ caller }) func registerUser(name : Text, email : Text) : async () {
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("User already exists");
    };
    let user : User = {
      name;
      email;
      role = #subscriber;
      subscriptionActive = true;
      selectedCharityId = null;
      charityContributionPercent = 10;
      golfScores = [];
    };
    userProfiles.add(caller, user);
  };

  public shared ({ caller }) func updateCallerProfile(name : Text, email : Text, selectedCharityId : ?Nat, charityContributionPercent : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?existingUser) {
        let updatedUser : User = {
          name;
          email;
          role = existingUser.role;
          subscriptionActive = existingUser.subscriptionActive;
          selectedCharityId;
          charityContributionPercent;
          golfScores = existingUser.golfScores;
        };
        userProfiles.add(caller, updatedUser);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async User {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) { user };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async User {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getAllUsers() : async [User] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.values().toArray().sort();
  };

  // Charity Management
  public shared ({ caller }) func addCharity(charity : Charity) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add charities");
    };
    let newCharity : Charity = {
      charity with
      id = nextCharityId;
    };
    charities.add(nextCharityId, newCharity);
    nextCharityId += 1;
  };

  public shared ({ caller }) func updateCharity(charity : Charity) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update charities");
    };
    charities.add(charity.id, charity);
  };

  public shared ({ caller }) func deleteCharity(charityId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete charities");
    };
    charities.remove(charityId);
  };

  public query func getCharities() : async [Charity] {
    charities.values().toArray().sort();
  };

  public query func getFeaturedCharities() : async [Charity] {
    charities.values().toArray().filter(func(charity) { charity.featured }).sort();
  };

  // Golf Score Management
  public shared ({ caller }) func addGolfScore(score : Nat, dateText : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add golf scores");
    };
    
    if (score < 1 or score > 45) {
      Runtime.trap("Invalid golf score");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) {
        let newScore : GolfScore = {
          score;
          dateText;
        };

        let mutableScores = List.empty<GolfScore>();
        mutableScores.add(newScore);

        let currentScores = user.golfScores;
        let scoresCount = currentScores.size();

        if (scoresCount >= 5) {
          let oldScores = currentScores.sliceToArray(0, 4);
          mutableScores.addAll(oldScores.values());
        } else {
          mutableScores.addAll(currentScores.values());
        };
        let updatedUser : User = {
          user with golfScores = mutableScores.toArray();
        };

        userProfiles.add(caller, updatedUser);
      };
    };
  };

  public query ({ caller }) func getGolfScores(user : Principal) : async [GolfScore] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own golf scores");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?profile) { profile.golfScores };
    };
  };

  // Draw Management
  public shared ({ caller }) func createDraw(draw : Draw) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create draws");
    };
    let newDraw : Draw = {
      draw with
      id = nextDrawId;
      drawDate = Time.now();
      status = #pending;
    };
    draws.add(nextDrawId, newDraw);
    nextDrawId += 1;
  };

  public shared ({ caller }) func updateDraw(draw : Draw) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update draws");
    };
    draws.add(draw.id, draw);
  };

  public shared ({ caller }) func publishDraw(drawId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can publish draws");
    };
    switch (draws.get(drawId)) {
      case (null) { Runtime.trap("Draw does not exist") };
      case (?draw) {
        let updatedDraw : Draw = {
          draw with status = #published;
        };
        draws.add(drawId, updatedDraw);
      };
    };
  };

  public query func getPublishedDraws() : async [Draw] {
    draws.values().toArray().filter(func(draw) { draw.status == #published });
  };

  // Winner Management
  public shared ({ caller }) func addWinner(winner : Winner) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add winners");
    };
    let winnerId = winner.drawId * 1000 + nextDrawId;
    winners.add(winnerId, winner);
  };

  public shared ({ caller }) func markWinnerAsPaid(winnerId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can mark winners as paid");
    };
    switch (winners.get(winnerId)) {
      case (null) { Runtime.trap("Winner does not exist") };
      case (?winner) {
        let updatedWinner : Winner = {
          winner with paymentStatus = #paid;
        };
        winners.add(winnerId, updatedWinner);
      };
    };
  };

  public query ({ caller }) func getWinnersByUser(user : Principal) : async [Winner] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own winnings");
    };
    winners.values().toArray().filter(func(winner) { winner.userId == user });
  };

  public query func getWinnersByDraw(drawId : Nat) : async [Winner] {
    winners.values().toArray().filter(func(winner) { winner.drawId == drawId });
  };

  // Helper Functions
  public query ({ caller }) func isUserRegistered() : async Bool {
    userProfiles.containsKey(caller);
  };

  public query ({ caller }) func getTotalUsers() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    userProfiles.size();
  };

  public query ({ caller }) func getTotalCharityContributions() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };
    var total = 0;
    for (user in userProfiles.values()) {
      total += user.charityContributionPercent;
    };
    total;
  };
};
