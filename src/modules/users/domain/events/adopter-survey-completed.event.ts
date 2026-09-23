export class AdopterSurveyCompletedEvent {
  constructor(
    public readonly userId: string,
    public readonly profileId: string,
    public readonly compatibilityData: Record<string, any> | null,
  ) {}
}
