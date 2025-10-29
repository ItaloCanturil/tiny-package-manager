import * as fs from "fs-extra";
import * as yaml from "js-yaml";
import type { Manifest } from "./resolve";
import * as utils from "./utils";

interface Lock {
  [index: string]: {
    version: string;
    url: string;
    shasum: string;
    dependencies: { [dependency: string]: string };
  };
}

const oldLock: Lock = Object.create(null);

const newLock: Lock = Object.create(null);

export function updateOrCreate(name: string, info: Lock[string]) {
  if (!newLock[name]) {
    newLock[name] = Object.create(null);
  }

  Object.assign(newLock[name]!, info);
}

export function getItem(name: string, constraint: string): Manifest | null {
  const item = oldLock[`${name}@${constraint}`];

  if (!item) {
    return null;
  }

  return {
    [item.version]: {
      dependencies: item.dependencies,
      dist: { shasum: item.shasum, tarball: item.url },
    },
  };
}

export async function writeLock() {
  await fs.writeFile(
    "./bero-pm.yml",
    yaml.dump(utils.sortKeys(newLock), { noRefs: true }),
  );
}

export async function readLock() {
  if (await fs.pathExists("./bero-pm.yml")) {
    Object.assign(oldLock, yaml.load(await fs.readFile("bero-pm.yml", "utf8")));
  }
}
