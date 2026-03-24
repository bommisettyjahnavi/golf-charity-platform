import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Charity,
  Draw,
  GolfScore,
  ShoppingItem,
  User,
  Winner,
} from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useCallerProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<User | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsRegistered() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isRegistered"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isUserRegistered();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCharities() {
  const { actor, isFetching } = useActor();
  return useQuery<Charity[]>({
    queryKey: ["charities"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCharities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFeaturedCharities() {
  const { actor, isFetching } = useActor();
  return useQuery<Charity[]>({
    queryKey: ["featuredCharities"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedCharities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePublishedDraws() {
  const { actor, isFetching } = useActor();
  return useQuery<Draw[]>({
    queryKey: ["publishedDraws"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedDraws();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGolfScores(principal: string | undefined) {
  const { actor, isFetching } = useActor();
  const { Principal } = require("@icp-sdk/core/principal");
  return useQuery<GolfScore[]>({
    queryKey: ["golfScores", principal],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getGolfScores(Principal.fromText(principal));
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<User[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTotalUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["totalUsers"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getTotalUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTotalCharityContributions() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["totalCharityContributions"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getTotalCharityContributions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWinnersByUser(principal: string | undefined) {
  const { actor, isFetching } = useActor();
  const { Principal } = require("@icp-sdk/core/principal");
  return useQuery<Winner[]>({
    queryKey: ["winnersByUser", principal],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getWinnersByUser(Principal.fromText(principal));
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useWinnersByDraw(drawId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Winner[]>({
    queryKey: ["winnersByDraw", drawId?.toString()],
    queryFn: async () => {
      if (!actor || drawId === undefined) return [];
      return actor.getWinnersByDraw(drawId);
    },
    enabled: !!actor && !isFetching && drawId !== undefined,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, email }: { name: string; email: string }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.registerUser(name, email);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerProfile"] });
      qc.invalidateQueries({ queryKey: ["isRegistered"] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      email,
      selectedCharityId,
      charityContributionPercent,
    }: {
      name: string;
      email: string;
      selectedCharityId: bigint | null;
      charityContributionPercent: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateCallerProfile(
        name,
        email,
        selectedCharityId,
        charityContributionPercent,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useAddGolfScore() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      score,
      dateText,
    }: {
      score: bigint;
      dateText: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addGolfScore(score, dateText);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["golfScores"] });
      qc.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useAddCharity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (charity: Charity) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addCharity(charity);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["charities"] });
      qc.invalidateQueries({ queryKey: ["featuredCharities"] });
    },
  });
}

export function useUpdateCharity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (charity: Charity) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateCharity(charity);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["charities"] });
      qc.invalidateQueries({ queryKey: ["featuredCharities"] });
    },
  });
}

export function useDeleteCharity() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (charityId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteCharity(charityId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["charities"] });
      qc.invalidateQueries({ queryKey: ["featuredCharities"] });
    },
  });
}

export function useCreateDraw() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (draw: Draw) => {
      if (!actor) throw new Error("Actor not available");
      await actor.createDraw(draw);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publishedDraws"] });
    },
  });
}

export function useUpdateDraw() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (draw: Draw) => {
      if (!actor) throw new Error("Actor not available");
      await actor.updateDraw(draw);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publishedDraws"] });
    },
  });
}

export function usePublishDraw() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (drawId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.publishDraw(drawId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["publishedDraws"] });
    },
  });
}

export function useMarkWinnerPaid() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (winnerId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.markWinnerAsPaid(winnerId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["winnersByDraw"] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (items: ShoppingItem[]) => {
      if (!actor) throw new Error("Actor not available");
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
      );
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) throw new Error("Stripe session missing url");
      return session;
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["stripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfig() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: {
      secretKey: string;
      allowedCountries: string[];
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.setStripeConfiguration({
        secretKey: config.secretKey,
        allowedCountries: config.allowedCountries,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stripeConfigured"] });
    },
  });
}

export function useAddWinner() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (winner: Winner) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addWinner(winner);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["winnersByDraw"] });
    },
  });
}
