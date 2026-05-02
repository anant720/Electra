// prisma/seed.ts — ELECTRA Supabase Seed Runner
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { REGIONS, COUNTRIES, PERSONAS, SCENARIOS } from './seeds/core';
import { SOURCES } from './seeds/sources';
import { AXIOMS } from './seeds/axioms';
import { DOCUMENTS } from './seeds/documents';
import { RESOLUTION_PATHS } from './seeds/resolutions';
import { MYTHS } from './seeds/myths';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ELECTRA (Supabase)...\n');

  // 1. Regions
  console.log('📍 Regions...');
  for (const r of REGIONS) {
    await (prisma as any).region.upsert({ where: { code: r.code }, update: r, create: r });
  }
  console.log(`  ✓ ${REGIONS.length} regions`);

  // 2. Countries
  console.log('🌍 Countries...');
  const regionMap: Record<string, string> = {};
  const allRegions = await (prisma as any).region.findMany();
  for (const r of allRegions) regionMap[r.code as string] = r.id as string;

  for (const c of COUNTRIES) {
    const { regionCode, ...data } = c as any;
    const regionId: string = regionMap[regionCode as string] as string;
    await (prisma as any).country.upsert({
      where: { code: data.code },
      update: { ...data, regionId },
      create: { ...data, regionId },
    });
  }
  console.log(`  ✓ ${COUNTRIES.length} countries`);

  // 3. Personas
  console.log('👤 Personas...');
  for (const p of PERSONAS) {
    await (prisma as any).persona.upsert({ where: { code: p.code }, update: p, create: p });
  }
  console.log(`  ✓ ${PERSONAS.length} personas`);

  // 4. Scenarios
  console.log('🚨 Scenarios...');
  for (const s of SCENARIOS) {
    await (prisma as any).scenario.upsert({ where: { code: s.code }, update: s, create: s });
  }
  console.log(`  ✓ ${SCENARIOS.length} scenarios`);

  // 5. Sources
  console.log('🏛️  Sources...');
  const countryMap: Record<string, string> = {};
  const allCountries = await (prisma as any).country.findMany();
  for (const c of allCountries) countryMap[c.code as string] = c.id as string;

  for (const s of SOURCES) {
    const { countryCode, ...data } = s as any;
    const countryId = countryCode ? (countryMap[countryCode as string] as string) : null;
    await (prisma as any).sourceRegistry.upsert({
      where: { code: data.code },
      update: { ...data, countryId },
      create: { ...data, countryId },
    });
  }
  console.log(`  ✓ ${SOURCES.length} sources`);

  // 6. Civic Axioms
  console.log('📋 Civic Axioms...');
  const sourceMap: Record<string, string> = {};
  const allSources = await (prisma as any).sourceRegistry.findMany();
  for (const s of allSources) sourceMap[s.code as string] = s.id as string;

  for (const a of AXIOMS) {
    const { countryCode, sourceCode, ...data } = a as any;
    const countryId = countryMap[countryCode as string] as string;
    const sourceId = sourceCode ? (sourceMap[sourceCode as string] as string) : null;
    await (prisma as any).civicAxiom.upsert({
      where: { code: data.code },
      update: { ...data, countryId, sourceId },
      create: { ...data, countryId, sourceId },
    });
  }
  console.log(`  ✓ ${AXIOMS.length} civic axioms`);

  // 6.5. Myths
  console.log('🛡️  Civic Myths...');
  for (const m of MYTHS) {
    const { countryCode, sourceCode, ...data } = m as any;
    const countryId = countryMap[countryCode as string] as string;
    const sourceId = sourceCode ? (sourceMap[sourceCode as string] as string) : null;
    await (prisma as any).civicAxiom.upsert({
      where: { code: data.code },
      update: { ...data, countryId, sourceId },
      create: { ...data, countryId, sourceId },
    });
  }
  console.log(`  ✓ ${MYTHS.length} civic myths`);

  // 7. Official Documents
  console.log('📄 Official Documents...');
  for (const d of DOCUMENTS) {
    const { countryCode, ...data } = d as any;
    const countryId = countryMap[countryCode as string] as string;
    await (prisma as any).officialDocument.upsert({
      where: { countryId_code: { countryId, code: data.code } },
      update: { ...data, countryId },
      create: { ...data, countryId },
    });
  }
  console.log(`  ✓ ${DOCUMENTS.length} documents`);

  // 8. Resolution Paths
  console.log('🛡️  Resolution Paths...');
  const scenarioMap: Record<string, string> = {};
  const allScenarios = await (prisma as any).scenario.findMany();
  for (const s of allScenarios) scenarioMap[s.code as string] = s.id as string;

  for (const rp of RESOLUTION_PATHS) {
    const { scenarioCode, countryCode, ...data } = rp as any;
    const scenarioId = scenarioMap[scenarioCode as string] as string;
    const countryId = countryMap[countryCode as string] as string;
    await (prisma as any).resolutionPath.upsert({
      where: { scenarioId_countryId_stepNumber: { scenarioId, countryId, stepNumber: data.stepNumber } },
      update: { ...data, scenarioId, countryId },
      create: { ...data, scenarioId, countryId },
    });
  }
  console.log(`  ✓ ${RESOLUTION_PATHS.length} resolution paths`);

  console.log('\n✅ ELECTRA seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
