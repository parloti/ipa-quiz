import { generateSoundManifests } from './sound-manifests';

const repoRoot = process.cwd();

generateSoundManifests(repoRoot).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
